import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth'
import { generateQRCode } from '@/lib/qr'
import { generatePDFFromHTML, generatePDFFromCanvas, generatePDFFromMapper, mergeTemplateVariables } from '@/lib/pdf'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin' || !payload.universityId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId, studentIds } = body

    if (!templateId) {
      return NextResponse.json(
        { error: 'Missing required field: templateId' },
        { status: 400 }
      )
    }

    // Fetch template
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        universityId: payload.universityId,
      },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Fetch university
    const university = await prisma.university.findUnique({
      where: { id: payload.universityId },
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    // Get students to generate documents for
    let students
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      // Generate for specific students
      students = await prisma.student.findMany({
        where: {
          id: { in: studentIds },
          universityId: payload.universityId,
        },
      })
    } else {
      // Generate for all students
      students = await prisma.student.findMany({
        where: {
          universityId: payload.universityId,
        },
      })
    }

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No students found' },
        { status: 404 }
      )
    }

    const results = {
      success: 0,
      skipped: 0,
      failed: 0,
      documents: [] as any[],
      errors: [] as string[],
    }

    // Generate documents for each student
    for (const student of students) {
      try {
        // Check if document already exists
        const existingDoc = await prisma.document.findFirst({
          where: {
            studentId: student.id,
            templateId: template.id,
          },
        })

        if (existingDoc) {
          results.skipped++
          continue
        }

        // Generate QR hash if enabled
        let qrHash = null
        let qrUrl = null
        if (university.qrEnabled && template.qrEnabled) {
          qrHash = crypto.randomBytes(16).toString('hex')
          qrUrl = await generateQRCode(qrHash)
        }

        // Create document record
        const document = await prisma.document.create({
          data: {
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            universityId: payload.universityId,
            studentId: student.id,
            templateId: template.id,
            title: template.name,
            qrHash,
            qrUrl,
            isPublished: false,
            updatedAt: new Date(),
            metadata: JSON.stringify({
              studentName: student.name,
              rollNo: student.rollNo,
              regNo: student.regNo,
              generatedAt: new Date().toISOString(),
            }),
          },
        })

        // Generate actual PDF
        try {
          const outputDir = path.join(process.cwd(), 'public', 'uploads', 'documents')
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
          }

          const fileName = `${document.id}.pdf`
          const outputPath = path.join(outputDir, fileName)
          const pdfUrl = `/uploads/documents/${fileName}`

          // Prepare student data for variable replacement
          const studentData: Record<string, any> = {
            studentName: student.name,
            rollNo: student.rollNo,
            regNo: student.regNo || '',
            fatherName: student.fatherName || '',
            motherName: student.motherName || '',
            dob: student.dob ? new Date(student.dob).toLocaleDateString() : '',
            email: student.email || '',
            mobile: student.mobile || '',
            ...(student.customData ? JSON.parse(student.customData) : {}),
          }

          // Prepare QR code data
          const qrCodeData = qrHash
            ? {
                enabled: true,
                data: qrHash,
                position: template.qrPosition ? JSON.parse(template.qrPosition) : undefined,
              }
            : undefined

          // Generate PDF based on template type
          if (template.type === 'HTML') {
            // Rich text editor - use HTML content
            let htmlContent = template.htmlContent || '<html><body><p>No content</p></body></html>'
            
            // Replace variables in HTML
            htmlContent = mergeTemplateVariables(htmlContent, studentData)
            
            // Wrap in a styled document
            const styledHtml = `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { 
                      font-family: Arial, sans-serif; 
                      padding: 40px; 
                      max-width: 800px; 
                      margin: 0 auto;
                    }
                    h1, h2, h3 { margin-top: 0.5em; margin-bottom: 0.5em; }
                    p { margin: 0.5em 0; }
                    ul, ol { padding-left: 1.5em; }
                  </style>
                </head>
                <body>
                  ${htmlContent}
                </body>
              </html>
            `

            await generatePDFFromHTML({
              html: styledHtml,
              qrCode: qrCodeData,
              outputPath,
            })
          } else if (template.type === 'PDF_MAPPER') {
            // PDF/JPEG Field Mapper
            if (!template.backgroundUrl) {
              throw new Error('Background URL is required for PDF_MAPPER template')
            }
            
            const backgroundPath = path.join(process.cwd(), 'public', template.backgroundUrl)
            
            if (!fs.existsSync(backgroundPath)) {
              throw new Error(`Background file not found: ${backgroundPath}`)
            }
            
            const mappingConfig = template.mappingConfig ? JSON.parse(template.mappingConfig) : { fields: [] }

            await generatePDFFromMapper({
              backgroundPath,
              fields: mappingConfig.fields || [],
              data: studentData,
              outputPath,
              qrCode: qrCodeData,
            })
          } else if (template.type === 'CANVAS' || template.htmlConfig) {
            // Legacy Fabric.js canvas - use htmlConfig
            if (!template.htmlConfig) {
              throw new Error('Canvas configuration is required for CANVAS template')
            }
            
            const canvasJSON = JSON.parse(template.htmlConfig)
            await generatePDFFromCanvas(canvasJSON, outputPath, studentData, qrCodeData)
          } else {
            throw new Error(`Unsupported template type: ${template.type}`)
          }

          // Update document with PDF URL
          await prisma.document.update({
            where: { id: document.id },
            data: { pdfUrl },
          })
        } catch (pdfError) {
          console.error('PDF generation error for student', student.rollNo, ':', pdfError)
          // Continue with other students even if one fails
        }

        results.success++
        results.documents.push({
          id: document.id,
          studentName: student.name,
          rollNo: student.rollNo,
        })
      } catch (error: any) {
        results.failed++
        results.errors.push(`Failed for ${student.name} (${student.rollNo}): ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      total: students.length,
      generated: results.success,
      skipped: results.skipped,
      failed: results.failed,
      documents: results.documents,
      errors: results.errors.length > 0 ? results.errors : undefined,
    })
  } catch (error) {
    console.error('Bulk generate documents error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

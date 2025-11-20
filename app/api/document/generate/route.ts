import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth'
import { generateQRCode } from '@/lib/qr'
import { generatePDFFromHTML, generatePDFFromCanvas, generatePDFFromMapper, mergeTemplateVariables } from '@/lib/pdf'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

/**
 * Generate a document for a student using a specified template.
 *
 * Authentication:
 *   - Requires Bearer token in the Authorization header.
 *   - User must have 'admin' role and a valid universityId.
 *
 * Request Body (application/json):
 *   {
 *     "studentId": string,   // Required. The ID of the student.
 *     "templateId": string   // Required. The ID of the template to use.
 *   }
 *
 * Responses:
 *   200 OK
 *     {
 *       "documentId": string,
 *       "qrCode": string, // base64-encoded QR code image
 *       ... // other document fields
 *     }
 *   400 Bad Request
 *     { "error": "Missing required fields: studentId and templateId" }
 *   401 Unauthorized
 *     { "error": "Unauthorized" }
 *   404 Not Found
 *     { "error": "Student not found" } or { "error": "Template not found" }
 *   500 Internal Server Error
 *     { "error": "Internal server error" }
 */
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
    const { studentId, templateId } = body

    if (!studentId || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId and templateId' },
        { status: 400 }
      )
    }

    // Fetch student
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        universityId: payload.universityId,
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
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

    // Check if document already exists
    const existingDoc = await prisma.document.findFirst({
      where: {
        studentId: student.id,
        templateId: template.id,
      },
    })

    if (existingDoc) {
      return NextResponse.json(
        { 
          error: 'Document already exists for this student and template',
          document: existingDoc 
        },
        { status: 400 }
      )
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
        universityId: payload.universityId,
        studentId: student.id,
        templateId: template.id,
        title: template.name,
        qrHash,
        qrUrl,
        isPublished: false,
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
        const backgroundPath = path.join(process.cwd(), 'public', template.backgroundUrl || '')
        const mappingConfig = template.mappingConfig ? JSON.parse(template.mappingConfig) : { fields: [] }

        await generatePDFFromMapper({
          backgroundPath,
          fields: mappingConfig.fields || [],
          data: studentData,
          outputPath,
          qrCode: qrCodeData,
        })
      } else if (template.htmlConfig) {
        // Legacy Fabric.js canvas - use htmlConfig
        const canvasJSON = JSON.parse(template.htmlConfig)
        await generatePDFFromCanvas(canvasJSON, outputPath, studentData, qrCodeData)
      }

      // Update document with PDF URL
      await prisma.document.update({
        where: { id: document.id },
        data: { pdfUrl },
      })

      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          title: document.title,
          pdfUrl: pdfUrl,
          qrHash: document.qrHash,
          createdAt: document.createdAt,
        },
      })
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError)
      // Return success with document record even if PDF generation fails
      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          title: document.title,
          qrHash: document.qrHash,
          createdAt: document.createdAt,
        },
        warning: 'Document record created but PDF generation failed',
      })
    }
  } catch (error) {
    console.error('Generate document error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth'
import { generateQRCode } from '@/lib/qr'
import crypto from 'crypto'

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

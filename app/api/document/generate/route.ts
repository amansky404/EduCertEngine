import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth'
import { generateQRCode } from '@/lib/qr'
import crypto from 'crypto'

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

    // Note: Actual PDF generation would happen here
    // For now, we just create the database record
    // PDF generation can be done in a background job or on-demand

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        qrHash: document.qrHash,
        createdAt: document.createdAt,
      },
    })
  } catch (error) {
    console.error('Generate document error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

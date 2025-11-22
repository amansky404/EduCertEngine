import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params

    if (!hash) {
      return NextResponse.json(
        { error: 'Verification hash is required' },
        { status: 400 }
      )
    }

    // Find document by QR hash
    const document = await prisma.document.findUnique({
      where: {
        qrHash: hash,
      },
      include: {
        Student: {
          select: {
            name: true,
            rollNo: true,
            regNo: true,
          },
        },
        University: {
          select: {
            name: true,
            subdomain: true,
            logo: true,
          },
        },
        Template: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or verification code is invalid' },
        { status: 404 }
      )
    }

    // Check if document is published
    if (!document.isPublished) {
      return NextResponse.json(
        { error: 'This document has not been published or has been revoked' },
        { status: 403 }
      )
    }

    // Return document details
    return NextResponse.json({
      id: document.id,
      title: document.title,
      publishedAt: document.publishedAt,
      student: document.Student,
      university: document.University,
      template: document.Template,
      metadata: document.metadata,
    })
  } catch (error) {
    console.error('Verify document error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

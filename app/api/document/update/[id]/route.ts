import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractToken(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin' || !payload.universityId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documentId = params.id
    const body = await request.json()

    // Verify the document belongs to this university
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        universityId: payload.universityId,
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Update the document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        isPublished: body.isPublished !== undefined ? body.isPublished : document.isPublished,
        title: body.title || document.title,
      },
    })

    return NextResponse.json({
      success: true,
      document: updatedDocument,
    })
  } catch (error) {
    console.error('Update document error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

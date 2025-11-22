import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, description, qrEnabled, universityId } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // Validate template type
    const validTypes = ['HTML', 'PDF_MAPPER', 'CANVAS']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid template type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Super admin must provide universityId, regular admin uses their own
    const targetUniversityId = payload.role === 'super_admin' 
      ? universityId 
      : payload.universityId

    if (!targetUniversityId) {
      return NextResponse.json(
        { error: 'University ID is required' },
        { status: 400 }
      )
    }

    const template = await prisma.template.create({
      data: {
        id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        universityId: targetUniversityId,
        name,
        type,
        description,
        qrEnabled: qrEnabled !== undefined ? qrEnabled : true,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

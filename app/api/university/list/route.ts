import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify token
    const token = extractToken(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If super admin, return all universities
    if (payload.role === 'super_admin') {
      const universities = await prisma.university.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              admins: true,
              students: true,
              templates: true,
              documents: true,
            },
          },
        },
      })

      return NextResponse.json({ universities })
    }

    // If university admin, return only their university
    if (payload.role === 'admin' && payload.universityId) {
      const university = await prisma.university.findUnique({
        where: { id: payload.universityId },
        include: {
          _count: {
            select: {
              admins: true,
              students: true,
              templates: true,
              documents: true,
            },
          },
        },
      })

      return NextResponse.json({ universities: university ? [university] : [] })
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  } catch (error) {
    console.error('List universities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

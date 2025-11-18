import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || !payload.universityId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const students = await prisma.student.findMany({
      where: {
        universityId: payload.universityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('List students error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

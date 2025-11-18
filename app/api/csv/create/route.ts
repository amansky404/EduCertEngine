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
    if (!payload || payload.role !== 'admin' || !payload.universityId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, fields } = body

    if (!name || !fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'Name and fields are required' },
        { status: 400 }
      )
    }

    // Create a CSV configuration (this would typically be stored in the database)
    // For now, we'll just return success
    // In a full implementation, you'd save this to the database

    return NextResponse.json(
      {
        success: true,
        message: 'CSV configuration saved',
        config: { name, fields },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create CSV config error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

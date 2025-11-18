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
    const { rollNo, regNo, name, fatherName, motherName, dob, email, mobile } = body

    if (!rollNo || !name) {
      return NextResponse.json(
        { error: 'Roll number and name are required' },
        { status: 400 }
      )
    }

    // Check if student already exists
    const existing = await prisma.student.findFirst({
      where: {
        universityId: payload.universityId,
        rollNo,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Student with this roll number already exists' },
        { status: 400 }
      )
    }

    const student = await prisma.student.create({
      data: {
        universityId: payload.universityId,
        rollNo,
        regNo: regNo || null,
        name,
        fatherName: fatherName || null,
        motherName: motherName || null,
        dob: dob ? new Date(dob) : null,
        email: email || null,
        mobile: mobile || null,
      },
    })

    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const value = searchParams.get('value')
    const subdomain = searchParams.get('subdomain')

    if (!type || !value || !subdomain) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Find university by subdomain
    const university = await prisma.university.findUnique({
      where: { subdomain },
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    // Build search query
    let student
    if (type === 'roll') {
      student = await prisma.student.findFirst({
        where: {
          universityId: university.id,
          rollNo: value,
        },
        include: {
          documents: {
            where: {
              isPublished: true,
            },
            include: {
              template: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      })
    } else if (type === 'mobile') {
      student = await prisma.student.findFirst({
        where: {
          universityId: university.id,
          mobile: value,
        },
        include: {
          documents: {
            where: {
              isPublished: true,
            },
            include: {
              template: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      })
    } else if (type === 'dob') {
      student = await prisma.student.findFirst({
        where: {
          universityId: university.id,
          dob: new Date(value),
        },
        include: {
          documents: {
            where: {
              isPublished: true,
            },
            include: {
              template: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      })
    }

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({
      student: {
        name: student.name,
        rollNo: student.rollNo,
        regNo: student.regNo,
        email: student.email,
      },
      documents: student.documents,
    })
  } catch (error) {
    console.error('Student search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

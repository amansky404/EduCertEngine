import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify super admin token
    const token = extractToken(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      subdomain,
      slug,
      adminEmail,
      adminPassword,
      adminName,
      primaryColor,
      secondaryColor,
      qrEnabled,
    } = body

    if (!name || !subdomain || !slug || !adminEmail || !adminPassword || !adminName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if subdomain already exists
    const existingUniversity = await prisma.university.findUnique({
      where: { subdomain },
    })

    if (existingUniversity) {
      return NextResponse.json(
        { error: 'Subdomain already exists' },
        { status: 400 }
      )
    }

    // Hash admin password
    const hashedPassword = await hashPassword(adminPassword)

    // Create university with admin
    const university = await prisma.university.create({
      data: {
        name,
        subdomain,
        slug,
        primaryColor: primaryColor || '#3b82f6',
        secondaryColor: secondaryColor || '#1e40af',
        qrEnabled: qrEnabled !== undefined ? qrEnabled : true,
        admins: {
          create: {
            email: adminEmail,
            password: hashedPassword,
            name: adminName,
            role: 'admin',
          },
        },
      },
      include: {
        admins: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({ university }, { status: 201 })
  } catch (error) {
    console.error('Create university error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

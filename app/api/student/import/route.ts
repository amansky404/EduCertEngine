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

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Read CSV content
    const content = await file.text()
    const lines = content.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or invalid' },
        { status: 400 }
      )
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim())

    // Validate required fields
    if (!headers.includes('roll_no') || !headers.includes('student_name')) {
      return NextResponse.json(
        { error: 'CSV must contain roll_no and student_name columns' },
        { status: 400 }
      )
    }

    // Parse students
    const students = []
    const errors = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const studentData: any = {}

      headers.forEach((header, index) => {
        studentData[header] = values[index] || null
      })

      // Map CSV fields to database fields
      const rollNo = studentData['roll_no']
      const name = studentData['student_name']

      if (!rollNo || !name) {
        errors.push(`Line ${i + 1}: Missing required fields`)
        continue
      }

      // Check if student exists
      const existing = await prisma.student.findFirst({
        where: {
          universityId: payload.universityId,
          rollNo,
        },
      })

      if (existing) {
        errors.push(`Line ${i + 1}: Student with roll number ${rollNo} already exists`)
        continue
      }

      try {
        const student = await prisma.student.create({
          data: {
            id: `stu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            universityId: payload.universityId,
            rollNo,
            name,
            regNo: studentData['reg_no'] || null,
            fatherName: studentData['father_name'] || null,
            motherName: studentData['mother_name'] || null,
            dob: studentData['dob'] ? new Date(studentData['dob']) : null,
            email: studentData['email'] || null,
            mobile: studentData['mobile'] || null,
            updatedAt: new Date(),
            customData: studentData,
          },
        })
        students.push(student)
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      imported: students.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Import students error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

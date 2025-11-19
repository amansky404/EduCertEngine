import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const zipFile = formData.get("zipFile") as File
    const mappingsStr = formData.get("mappings") as string
    const templateId = formData.get("templateId") as string

    if (!zipFile || !mappingsStr) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    const mappings = JSON.parse(mappingsStr)

    // Check if template exists and user has access
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    if (template.universityId !== decoded.universityId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "direct-uploads")
    await mkdir(uploadDir, { recursive: true })

    // Save ZIP file
    const timestamp = Date.now()
    const zipFilename = `${templateId}-${timestamp}-${zipFile.name}`
    const zipPath = path.join(uploadDir, zipFilename)
    
    const bytes = await zipFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(zipPath, buffer)

    // In a real implementation, you would:
    // 1. Extract the ZIP file
    // 2. Match files to students using the mappings
    // 3. Store documents in the database
    // 4. Generate QR codes if needed
    
    // For now, we'll just save the mapping configuration
    const config = {
      mappings: mappings,
      zipFileName: zipFile.name,
      zipPath: `/uploads/direct-uploads/${zipFilename}`,
      uploadedAt: new Date().toISOString(),
    }

    await prisma.template.update({
      where: { id: templateId },
      data: { 
        fileMapping: JSON.stringify(config),
        zipUrl: `/uploads/direct-uploads/${zipFilename}`,
      },
    })

    return NextResponse.json({ 
      success: true,
      count: mappings.length,
      message: "Files uploaded successfully. Documents are ready for processing."
    })
  } catch (error) {
    console.error("Error uploading files:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

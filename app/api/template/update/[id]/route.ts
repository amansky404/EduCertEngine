import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== "admin" && decoded.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templateId = params.id
    const body = await request.json()

    // Check if template exists and user has access
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Check if user has access to this template's university (skip for super_admin)
    if (decoded.role !== "super_admin" && template.universityId !== decoded.universityId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update template
    const updateData: any = {}
    
    if (body.htmlConfig !== undefined) {
      // Validate JSON if it's a string
      if (typeof body.htmlConfig === 'string') {
        try {
          JSON.parse(body.htmlConfig)
        } catch (e) {
          return NextResponse.json({ error: 'Invalid htmlConfig JSON' }, { status: 400 })
        }
      }
      updateData.htmlConfig = body.htmlConfig
    }
    
    if (body.htmlContent !== undefined) {
      updateData.htmlContent = body.htmlContent
    }
    
    if (body.mappingConfig !== undefined) {
      // Validate JSON if it's a string
      if (typeof body.mappingConfig === 'string') {
        try {
          JSON.parse(body.mappingConfig)
        } catch (e) {
          return NextResponse.json({ error: 'Invalid mappingConfig JSON' }, { status: 400 })
        }
      }
      updateData.mappingConfig = body.mappingConfig
    }
    
    if (body.backgroundUrl !== undefined) {
      updateData.backgroundUrl = body.backgroundUrl
    }
    
    if (body.fileMapping !== undefined) {
      updateData.fileMapping = body.fileMapping
    }
    
    if (body.zipUrl !== undefined) {
      updateData.zipUrl = body.zipUrl
    }
    
    if (body.qrEnabled !== undefined) {
      updateData.qrEnabled = body.qrEnabled
    }
    
    if (body.qrPosition !== undefined) {
      updateData.qrPosition = body.qrPosition
    }
    
    if (body.name !== undefined) {
      updateData.name = body.name
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description
    }
    
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive
    }

    const updatedTemplate = await prisma.template.update({
      where: { id: templateId },
      data: updateData,
    })

    return NextResponse.json({ 
      success: true,
      template: updatedTemplate 
    })
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

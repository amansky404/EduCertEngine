// PDF generation utilities
// Note: puppeteer and pdfkit are optional dependencies for runtime PDF generation
// They are not required for Next.js build

import fs from 'fs'
import path from 'path'
import { generateQRCodeBuffer } from './qr'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export interface PDFGenerationOptions {
  html?: string
  templateData?: any
  qrCode?: {
    enabled: boolean
    data: string
    position?: { x: number; y: number }
  }
  watermark?: string
  outputPath: string
}

export interface FieldMapping {
  id: string
  name: string
  label: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontFamily: string
  color: string
  type: "text" | "image" | "qr" | "date" | "number" | "checkbox" | "dropdown"
}

export interface PDFMapperOptions {
  backgroundPath: string
  fields: FieldMapping[]
  data: Record<string, any>
  outputPath: string
  qrCode?: {
    enabled: boolean
    data: string
    position?: { x: number; y: number }
  }
}

/**
 * Generate PDF from HTML using Puppeteer
 * Note: Requires puppeteer to be installed
 */
export async function generatePDFFromHTML(options: PDFGenerationOptions): Promise<string> {
  const { html, qrCode, outputPath } = options
  
  if (!html) {
    throw new Error('HTML content is required')
  }
  
  try {
    // Dynamic import to make puppeteer optional
    const puppeteer = await import('puppeteer' as any).catch(() => null)
    if (!puppeteer) {
      throw new Error('Puppeteer is not installed. Please install it to use HTML to PDF generation.')
    }
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    
    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      
      // Add QR code if enabled
      if (qrCode?.enabled && qrCode.data) {
        const qrBuffer = await generateQRCodeBuffer(qrCode.data)
        const qrBase64 = qrBuffer.toString('base64')
        
        await page.evaluate((qrData: string, position: any) => {
          const img = document.createElement('img')
          img.src = `data:image/png;base64,${qrData}`
          img.style.position = 'absolute'
          img.style.width = '100px'
          img.style.height = '100px'
          img.style.left = `${position?.x || 10}px`
          img.style.top = `${position?.y || 10}px`
          document.body.appendChild(img)
        }, qrBase64, qrCode.position)
      }
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      })
      
      return outputPath
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

/**
 * Generate PDF using PDFKit
 * Note: Requires pdfkit to be installed
 */
export async function generatePDFWithPDFKit(options: PDFGenerationOptions): Promise<string> {
  const { templateData, qrCode, outputPath } = options
  
  return new Promise(async (resolve, reject) => {
    try {
      // Dynamic import to make pdfkit optional
      const PDFDocumentModule = await import('pdfkit' as any).catch(() => null)
      if (!PDFDocumentModule) {
        throw new Error('PDFKit is not installed. Please install it to use PDF generation.')
      }
      
      const PDFDocument = PDFDocumentModule.default
      const doc = new PDFDocument({ size: 'A4' })
      const outputDir = path.dirname(outputPath)
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      const writeStream = fs.createWriteStream(outputPath)
      doc.pipe(writeStream)
      
      // Add content based on template data
      if (templateData) {
        doc.fontSize(20).text(templateData.title || 'Document', 100, 100)
        doc.fontSize(12).text(templateData.content || '', 100, 150)
      }
      
      // Add QR code if enabled
      if (qrCode?.enabled && qrCode.data) {
        generateQRCodeBuffer(qrCode.data).then((qrBuffer) => {
          const position = qrCode.position || { x: 50, y: 700 }
          doc.image(qrBuffer, position.x, position.y, { width: 100 })
          doc.end()
        })
      } else {
        doc.end()
      }
      
      writeStream.on('finish', () => {
        resolve(outputPath)
      })
      
      writeStream.on('error', (error) => {
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Generate PDF from field mapper template using pdf-lib
 * This supports PDF/JPEG background with positioned fields
 */
export async function generatePDFFromMapper(options: PDFMapperOptions): Promise<string> {
  const { backgroundPath, fields, data, outputPath, qrCode } = options
  
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Create a new PDF document or load existing background
    let pdfDoc: PDFDocument
    
    if (backgroundPath.endsWith('.pdf')) {
      // Load existing PDF
      const existingPdfBytes = fs.readFileSync(backgroundPath)
      pdfDoc = await PDFDocument.load(existingPdfBytes)
    } else {
      // Create new PDF with image background
      pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([595, 842]) // A4 size
      
      // Load and embed background image
      const imageBytes = fs.readFileSync(backgroundPath)
      let image
      
      if (backgroundPath.endsWith('.png')) {
        image = await pdfDoc.embedPng(imageBytes)
      } else if (backgroundPath.endsWith('.jpg') || backgroundPath.endsWith('.jpeg')) {
        image = await pdfDoc.embedJpg(imageBytes)
      }
      
      if (image) {
        const { width, height } = page.getSize()
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        })
      }
    }

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { height } = firstPage.getSize()
    
    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Add fields to PDF
    for (const field of fields) {
      const value = data[field.name] || ''
      
      if (field.type === 'text' || field.type === 'number' || field.type === 'date') {
        // Convert color hex to RGB
        const color = hexToRgb(field.color)
        
        firstPage.drawText(String(value), {
          x: field.x,
          y: height - field.y - field.fontSize, // Flip Y coordinate
          size: field.fontSize,
          font: font,
          color: rgb(color.r / 255, color.g / 255, color.b / 255),
        })
      } else if (field.type === 'checkbox' && value) {
        // Draw checkbox mark
        firstPage.drawText('✓', {
          x: field.x,
          y: height - field.y - 20,
          size: 20,
          font: boldFont,
          color: rgb(0, 0, 0),
        })
      } else if (field.type === 'image' && value) {
        // Handle image fields if path is provided
        try {
          if (fs.existsSync(value)) {
            const imgBytes = fs.readFileSync(value)
            let img
            
            if (value.endsWith('.png')) {
              img = await pdfDoc.embedPng(imgBytes)
            } else if (value.endsWith('.jpg') || value.endsWith('.jpeg')) {
              img = await pdfDoc.embedJpg(imgBytes)
            }
            
            if (img) {
              firstPage.drawImage(img, {
                x: field.x,
                y: height - field.y - field.height,
                width: field.width,
                height: field.height,
              })
            }
          }
        } catch (error) {
          console.error('Error embedding image:', error)
        }
      }
    }

    // Add QR code if enabled
    if (qrCode?.enabled && qrCode.data) {
      try {
        const qrBuffer = await generateQRCodeBuffer(qrCode.data)
        const qrImage = await pdfDoc.embedPng(qrBuffer)
        const position = qrCode.position || { x: 50, y: 50 }
        
        firstPage.drawImage(qrImage, {
          x: position.x,
          y: height - position.y - 100,
          width: 100,
          height: 100,
        })
      } catch (error) {
        console.error('Error adding QR code:', error)
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(outputPath, pdfBytes)
    
    return outputPath
  } catch (error) {
    console.error('Error generating PDF from mapper:', error)
    throw new Error('Failed to generate PDF from mapper')
  }
}

/**
 * Generate PDF from Fabric.js canvas JSON
 * This supports the HTML builder templates
 */
export async function generatePDFFromCanvas(
  canvasJSON: any,
  outputPath: string,
  data: Record<string, any> = {},
  qrCode?: { enabled: boolean; data: string; position?: { x: number; y: number } }
): Promise<string> {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    const width = canvasJSON.width || 595
    const height = canvasJSON.height || 842
    const page = pdfDoc.addPage([width, height])
    
    // Set background color if specified
    if (canvasJSON.backgroundColor) {
      const bgColor = hexToRgb(canvasJSON.backgroundColor)
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: height,
        color: rgb(bgColor.r / 255, bgColor.g / 255, bgColor.b / 255),
      })
    }

    // Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Process canvas objects
    if (canvasJSON.objects) {
      for (const obj of canvasJSON.objects) {
        if (obj.type === 'text' || obj.type === 'i-text') {
          let text = obj.text || ''
          
          // Replace variables with data
          text = mergeTemplateVariables(text, data)
          
          const color = hexToRgb(obj.fill || '#000000')
          const fontSize = obj.fontSize || 12
          const scaleX = obj.scaleX || 1
          const scaleY = obj.scaleY || 1
          
          page.drawText(text, {
            x: obj.left || 0,
            y: height - (obj.top || 0) - (fontSize * scaleY),
            size: fontSize * scaleY,
            font: font,
            color: rgb(color.r / 255, color.g / 255, color.b / 255),
          })
        } else if (obj.type === 'rect') {
          const fillColor = hexToRgb(obj.fill || '#ffffff')
          const strokeColor = hexToRgb(obj.stroke || '#000000')
          
          page.drawRectangle({
            x: obj.left || 0,
            y: height - (obj.top || 0) - (obj.height || 0) * (obj.scaleY || 1),
            width: (obj.width || 0) * (obj.scaleX || 1),
            height: (obj.height || 0) * (obj.scaleY || 1),
            color: rgb(fillColor.r / 255, fillColor.g / 255, fillColor.b / 255),
            borderColor: rgb(strokeColor.r / 255, strokeColor.g / 255, strokeColor.b / 255),
            borderWidth: obj.strokeWidth || 0,
          })
        } else if (obj.type === 'circle') {
          const fillColor = hexToRgb(obj.fill || '#ffffff')
          const radius = (obj.radius || 50) * (obj.scaleX || 1)
          
          page.drawCircle({
            x: (obj.left || 0) + radius,
            y: height - (obj.top || 0) - radius,
            size: radius,
            color: rgb(fillColor.r / 255, fillColor.g / 255, fillColor.b / 255),
            borderColor: rgb(0, 0, 0),
            borderWidth: obj.strokeWidth || 0,
          })
        }
        // Add more object types as needed
      }
    }

    // Add QR code if enabled
    if (qrCode?.enabled && qrCode.data) {
      try {
        const qrBuffer = await generateQRCodeBuffer(qrCode.data)
        const qrImage = await pdfDoc.embedPng(qrBuffer)
        const position = qrCode.position || { x: 50, y: 50 }
        
        page.drawImage(qrImage, {
          x: position.x,
          y: height - position.y - 100,
          width: 100,
          height: 100,
        })
      } catch (error) {
        console.error('Error adding QR code:', error)
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(outputPath, pdfBytes)
    
    return outputPath
  } catch (error) {
    console.error('Error generating PDF from canvas:', error)
    throw new Error('Failed to generate PDF from canvas')
  }
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  hex = hex.replace('#', '')
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  return { r, g, b }
}

/**
 * Merge template variables with data
 */
export function mergeTemplateVariables(template: string, data: Record<string, any>): string {
  let result = template
  
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, String(data[key] || ''))
  })
  
  return result
}

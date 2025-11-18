import puppeteer from 'puppeteer'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { generateQRCodeBuffer } from './qr'

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

/**
 * Generate PDF from HTML using Puppeteer
 */
export async function generatePDFFromHTML(options: PDFGenerationOptions): Promise<string> {
  const { html, qrCode, outputPath } = options
  
  if (!html) {
    throw new Error('HTML content is required')
  }
  
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    // Add QR code if enabled
    if (qrCode?.enabled && qrCode.data) {
      const qrBuffer = await generateQRCodeBuffer(qrCode.data)
      const qrBase64 = qrBuffer.toString('base64')
      
      await page.evaluate((qrData, position) => {
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
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

/**
 * Generate PDF using PDFKit
 */
export async function generatePDFWithPDFKit(options: PDFGenerationOptions): Promise<string> {
  const { templateData, qrCode, outputPath } = options
  
  return new Promise((resolve, reject) => {
    try {
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

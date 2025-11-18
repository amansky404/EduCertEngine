import QRCode from 'qrcode'
import crypto from 'crypto'

/**
 * Generate a unique verification hash
 */
export function generateVerificationHash(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate QR code data URL
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 200,
      margin: 1,
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR code buffer
 */
export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 200,
      margin: 1,
    })
  } catch (error) {
    console.error('Error generating QR code buffer:', error)
    throw new Error('Failed to generate QR code buffer')
  }
}

/**
 * Build verification URL
 */
export function buildVerificationUrl(subdomain: string, hash: string): string {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'
  return `https://${subdomain}.${baseDomain}/verify/${hash}`
}

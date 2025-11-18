import { NextRequest } from 'next/server'
import prisma from './prisma'

export interface TenantInfo {
  id: string
  name: string
  subdomain: string
  slug: string
  logo?: string | null
  primaryColor: string
  secondaryColor: string
  qrEnabled: boolean
  isActive: boolean
  landingPageData?: any
}

/**
 * Extract subdomain from request headers or hostname
 */
export function extractSubdomain(request: NextRequest): string | null {
  const hostname = request.headers.get('host') || ''
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'
  
  // Remove port if present
  const hostWithoutPort = hostname.split(':')[0]
  const baseWithoutPort = baseDomain.split(':')[0]
  
  // Check if hostname has a subdomain
  if (hostWithoutPort === baseWithoutPort) {
    return null // No subdomain
  }
  
  // Extract subdomain
  const subdomain = hostWithoutPort.replace(`.${baseWithoutPort}`, '')
  
  // Ignore www and common subdomains
  if (subdomain === 'www' || subdomain === baseWithoutPort) {
    return null
  }
  
  return subdomain
}

/**
 * Get tenant information by subdomain
 */
export async function getTenantBySubdomain(subdomain: string): Promise<TenantInfo | null> {
  try {
    const university = await prisma.university.findUnique({
      where: { subdomain },
      select: {
        id: true,
        name: true,
        subdomain: true,
        slug: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        qrEnabled: true,
        isActive: true,
        landingPageData: true,
      },
    })
    
    if (!university || !university.isActive) {
      return null
    }
    
    return university
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return null
  }
}

/**
 * Get tenant from request
 */
export async function getTenantFromRequest(request: NextRequest): Promise<TenantInfo | null> {
  const subdomain = extractSubdomain(request)
  
  if (!subdomain) {
    return null
  }
  
  return getTenantBySubdomain(subdomain)
}

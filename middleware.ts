import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'
  
  // Remove port if present
  const hostWithoutPort = hostname.split(':')[0]
  const baseWithoutPort = baseDomain.split(':')[0]
  
  // Extract subdomain
  let subdomain = null
  if (hostWithoutPort !== baseWithoutPort && !hostWithoutPort.startsWith('www.')) {
    subdomain = hostWithoutPort.replace(`.${baseWithoutPort}`, '')
  }
  
  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-subdomain', subdomain || '')
  requestHeaders.set('x-hostname', hostname)
  
  // If subdomain exists, rewrite to university routes
  if (subdomain) {
    const url = request.nextUrl.clone()
    
    // Admin panel routes
    if (url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`
      return NextResponse.rewrite(url, {
        request: {
          headers: requestHeaders,
        },
      })
    }
    
    // API routes
    if (url.pathname.startsWith('/api')) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
    
    // University public pages (result, verify, etc.)
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  // Main domain routes
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

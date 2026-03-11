import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session - IMPORTANT: don't remove this
  await supabase.auth.getUser()

  // Security headers
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  )
  supabaseResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  supabaseResponse.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  // Hybrid CSP: static for storefront (preserves ISR), nonce-based for dynamic routes
  const DYNAMIC_PREFIXES = ['/checkout', '/admin', '/account', '/auth', '/api']
  const pathname = request.nextUrl.pathname
  const isDynamic = DYNAMIC_PREFIXES.some(p => pathname.startsWith(p))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const imgSrc = `img-src 'self' data: ${supabaseUrl}`
  const baseCsp = `${imgSrc}; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; style-src 'self' 'unsafe-inline'`
  const isDev = process.env.NODE_ENV === 'development'

  let scriptSrc: string
  if (isDynamic) {
    const nonce = crypto.randomUUID()
    scriptSrc = `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ''}`
    // Forward nonce via request headers so downstream pages can read it
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-csp-nonce', nonce)
    const updatedResponse = NextResponse.next({
      request: { headers: requestHeaders },
    })
    // Preserve Supabase auth cookies on the new response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      updatedResponse.cookies.set(cookie)
    })
    supabaseResponse = updatedResponse
    // Re-apply security headers on the new response
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
    supabaseResponse.headers.set('X-Frame-Options', 'DENY')
    supabaseResponse.headers.set(
      'Referrer-Policy',
      'strict-origin-when-cross-origin'
    )
    supabaseResponse.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    )
    supabaseResponse.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  } else {
    scriptSrc = `script-src 'self'${isDev ? " 'unsafe-eval'" : ''}`
  }

  supabaseResponse.headers.set(
    'Content-Security-Policy',
    `${scriptSrc}; ${baseCsp}`
  )

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

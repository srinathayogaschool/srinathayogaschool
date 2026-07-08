import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/',
  '/about',
  '/teachers',
  '/courses',
  '/shop',
  '/contact',
  '/search',
  '/cart',
  '/privacy',
  '/terms',
  '/refund',
  '/checkout',
  '/auth/callback',
  '/app/login',
  '/app/signup',
  '/app/forgot-password',
  '/app/reset-password',
  '/dashboard/admin/login',
  '/dashboard/admin/forgot-password',
  '/dashboard/admin/reset-password',
  '/api',
  '/_next',
  '/images',
  '/favicon.ico',
  '/favicon.png',
  '/apple-icon.png',
  '/icon.svg',
  '/icon-dark-32x32.png',
  '/icon-light-32x32.png',
  '/manifest.webmanifest',
  '/manifest.json',
  '/sw.js',
  '/robots.txt',
  '/sitemap.xml',
  '/icons',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  if (isPublic) return NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const response = NextResponse.next()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
    cookieOptions: {
      name: 'sb-session',
    },
  })

  const { data: { session } } = await supabase.auth.getSession()

  // Protect /app and /learn
  if ((pathname.startsWith('/app') || pathname.startsWith('/learn')) && !session) {
    const loginUrl = new URL('/app/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protect /dashboard
  if (pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/dashboard/admin/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/).*)',
  ],
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'
  const requestOrigin = new URL(request.url).origin
  const isLocal = requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1')
  const baseUrl = isLocal ? requestOrigin : (process.env.NEXT_PUBLIC_APP_URL || requestOrigin)

  console.log('[Auth Callback] code:', !!code, 'next:', next, 'baseUrl:', baseUrl, 'isLocal:', isLocal)

  // Create redirect response FIRST so cookies can be set on it
  const redirectUrl = code 
    ? `${baseUrl}${next}` 
    : `${baseUrl}${next.startsWith('/dashboard') ? '/dashboard/admin/login?error=auth_callback_error' : '/app/login?error=auth_callback_error'}`
  
  const response = NextResponse.redirect(redirectUrl)

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If redirecting to admin dashboard, verify admin role
      if (next.startsWith('/dashboard')) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          if (profile?.role !== 'admin') {
            console.log('[Auth Callback] User is not admin, redirecting to login')
            const adminLoginRedirect = NextResponse.redirect(`${baseUrl}/dashboard/admin/login?error=not_admin`)
            return adminLoginRedirect
          }
        }
      }

      console.log('[Auth Callback] Success, redirecting to:', redirectUrl)
      return response
    }
    console.log('[Auth Callback] Exchange error:', error?.message)
  }

  console.log('[Auth Callback] Failed, redirecting to login')
  return response
}

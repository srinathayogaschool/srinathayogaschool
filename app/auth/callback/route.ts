import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const requestOrigin = new URL(request.url).origin
  const isLocal = requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1')
  const baseUrl = isLocal ? requestOrigin : (process.env.NEXT_PUBLIC_APP_URL || requestOrigin)

  console.log('[Auth Callback] code:', !!code, 'next:', next, 'baseUrl:', baseUrl, 'isLocal:', isLocal)

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('[Auth Callback] Missing Supabase config')
      return NextResponse.redirect(`${baseUrl}/dashboard/login?error=config_error`)
    }

    let response = NextResponse.redirect(`${baseUrl}${next}`)

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      console.log('[Auth Callback] Success, redirecting to:', `${baseUrl}${next}`)
      return response
    }
    console.log('[Auth Callback] Exchange error:', error?.message)
  }

  console.log('[Auth Callback] Failed, redirecting to login')
  return NextResponse.redirect(`${baseUrl}/dashboard/login?error=auth_callback_error`)
}

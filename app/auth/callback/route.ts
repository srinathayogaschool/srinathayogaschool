import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'
  const requestOrigin = new URL(request.url).origin
  const isLocal = requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1')
  const baseUrl = isLocal ? requestOrigin : (process.env.NEXT_PUBLIC_APP_URL || requestOrigin)

  console.log('[Auth Callback] code:', !!code, 'next:', next, 'baseUrl:', baseUrl, 'isLocal:', isLocal)

  if (code) {
    const supabase = createServerSupabaseClient()

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
            return NextResponse.redirect(`${baseUrl}/dashboard/admin/login?error=not_admin`)
          }
        }
      }

      console.log('[Auth Callback] Success, redirecting to:', `${baseUrl}${next}`)
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
    console.log('[Auth Callback] Exchange error:', error?.message)
  }

  // On failure, redirect based on intended destination
  const failureRedirect = next.startsWith('/dashboard') 
    ? '/dashboard/admin/login?error=auth_callback_error'
    : '/app/login?error=auth_callback_error'
  
  console.log('[Auth Callback] Failed, redirecting to login')
  return NextResponse.redirect(`${baseUrl}${failureRedirect}`)
}

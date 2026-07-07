import { createServerClient } from '@supabase/ssr'
import type { Database } from './supabase-types'

export function createServerSupabaseClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const { cookies: nextCookies } = require('next/headers')
          const cookieStore = nextCookies()
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          const { cookies: nextCookies } = require('next/headers')
          const cookieStore = nextCookies()
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
      cookieOptions: {
        name: 'sb-session',
      },
    }
  )
}

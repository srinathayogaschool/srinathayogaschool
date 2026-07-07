import { createServerClient } from '@supabase/ssr'
import type { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies'
import type { Database } from './supabase-types'

export function createServerSupabaseClient(
  cookieStore: {
    get: (name: string) => { value: string } | undefined
    set: (name: string, value: string, options: Record<string, unknown>) => void
    remove: (name: string, options: Record<string, unknown>) => void
  }
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as Record<string, unknown>)
          })
        },
      },
      cookieOptions: {
        name: 'sb-session',
      },
    }
  )
}

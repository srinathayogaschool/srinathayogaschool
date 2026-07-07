'use client'

import { useEffect, useState } from 'react'
import { Home } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import type { Profile } from '@/lib/supabase-types'

export default function AdminDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentProfile().then(p => {
      if (!p || p.role !== 'admin') return
      setProfile(p)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Home className="w-6 h-6 text-primary" />
        <div>
          <h1 className="font-serif text-xl text-foreground">Welcome back{profile?.name ? `, ${profile.name}` : ''}</h1>
          <p className="text-sm text-muted-foreground">Select a module from the sidebar to get started.</p>
        </div>
      </div>
    </div>
  )
}

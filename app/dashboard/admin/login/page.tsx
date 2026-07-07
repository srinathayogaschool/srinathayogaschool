'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createBrowserClient } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const sb = createBrowserClient()
      const { data, error: signInError } = await sb.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError

      const { data: profile } = await sb.from('profiles').select('role').eq('id', data.user.id).single()
      if (profile?.role !== 'admin') {
        await sb.auth.signOut()
        setError('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl border border-border p-8">
          <div className="text-center mb-8">
            <Image src="/images/logo.png" alt="Admin" width={48} height={48} className="mx-auto mb-4" />
            <h1 className="font-serif text-xl text-foreground">Admin Login</h1>
            <p className="text-muted-foreground text-sm mt-1">Srinatha Yoga School</p>
          </div>
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin email"
                required
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="password"
                required
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-3 rounded-xl font-medium transition-colors"
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

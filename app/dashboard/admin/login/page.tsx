'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { signInWithOtp } from '@/lib/auth'

const ADMIN_EMAIL = 'mysore@srinathayogaschool.com'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)

  const isAdminEmail = email.trim().toLowerCase() === ADMIN_EMAIL

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

  const handleMagicLink = async () => {
    if (!isAdminEmail) return
    setLoading(true)
    setError('')
    try {
      await signInWithOtp(email, '/dashboard')
      setMagicSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
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
          {magicSent && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl mb-4">
              Magic link sent! Check your email.
            </div>
          )}
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
            <div className="flex justify-end">
              <Link href="/dashboard/admin/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-3 rounded-xl font-medium transition-colors"
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </form>

          {isAdminEmail && !magicSent && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">Or login with magic link</span>
                </div>
              </div>
              <button
                onClick={handleMagicLink}
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 border border-input rounded-xl py-3 text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

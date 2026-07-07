'use client'

import { Suspense, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Mail, Lock, Loader2 } from 'lucide-react'

function DashboardLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [magicSent, setMagicSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const sb = createBrowserClient()
      
      if (mode === 'magic') {
        const { error: otpError } = await sb.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        })
        if (otpError) throw otpError
        setMagicSent(true)
        setLoading(false)
        return
      }

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
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Image src="/images/logo.png" alt="Srinatha Yoga School" width={48} height={48} className="h-12 w-auto" />
            <span className="font-serif text-xl font-semibold text-foreground">Srinatha Yoga School</span>
          </div>

          <h1 className="font-serif text-2xl text-foreground text-center mb-2">Admin Login</h1>
          <p className="text-muted-foreground text-center mb-8">Access Dashboard</p>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {magicSent && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl mb-4 border border-green-200">
              Magic link sent! Check your email and click the link to sign in.
            </div>
          )}

          <div className="mb-6">
            <div className="flex gap-2 bg-muted rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setMode('password'); setMagicSent(false); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'password'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => { setMode('magic'); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'magic'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Magic Link
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 pl-10 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {mode === 'password' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 pl-10 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === 'magic' ? 'Sending...' : 'Logging in...'}
                </>
              ) : (
                mode === 'magic' ? 'Send Magic Link' : 'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardLoginForm />
    </Suspense>
  )
}

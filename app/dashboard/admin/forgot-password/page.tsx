'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { resetPassword } from '@/lib/auth'

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border p-8 max-w-sm text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-foreground mb-2">Check Your Email</h1>
          <p className="text-muted-foreground mb-6">We sent a password reset link to <strong>{email}</strong></p>
          <Link href="/dashboard/admin/login"><button className="text-primary font-medium hover:underline">Back to Login</button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl border border-border p-8">
          <Link href="/dashboard/admin/login" className="flex items-center justify-center gap-3 mb-8">
            <Image src="/images/logo.png" alt="Srinatha Yoga School" width={48} height={48} className="h-12 w-auto" />
            <span className="font-serif text-xl font-semibold text-foreground">Admin Panel</span>
          </Link>
          <h1 className="font-serif text-2xl text-foreground text-center mb-2">Reset Password</h1>
          <p className="text-muted-foreground text-center mb-8">Enter your email and we'll send you a reset link</p>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@srinathayogaschool.com"
                required
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-3 rounded-xl font-medium transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/dashboard/admin/login" className="text-sm text-muted-foreground hover:text-foreground">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
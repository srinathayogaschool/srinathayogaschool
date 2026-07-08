'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentProfile, getCurrentUser, updateProfile } from '@/lib/auth'
import { uploadAvatar } from '@/lib/storage'
import type { Profile } from '@/lib/supabase-types'

export default function AdminProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [building, setBuilding] = useState('')
  const [street, setStreet] = useState('')
  const [pincode, setPincode] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser()
      if (user) setAuthEmail(user.email || '')

      const prof = await getCurrentProfile()
      if (prof) {
        setProfile(prof)
        setName(prof.name)
        setPhone(prof.phone || '')
        setAvatarUrl(prof.avatar_url || '')
        const parts = (prof.address || '').split('|')
        setBuilding(parts[0] || '')
        setStreet(parts[1] || '')
        setCity(parts[2] || '')
        setState(parts[3] || '')
        setPincode(parts[4] || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadAvatar(profile.id, file)
      if (url) {
        await updateProfile({ avatar_url: url })
        setAvatarUrl(url)
      } else {
        setError('Failed to upload image')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    if (pincode.length !== 6) return
    setLookupLoading(true)
    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      .then(r => r.json())
      .then(data => {
        if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length) {
          const po = data[0].PostOffice[0]
          setCity(po.District || po.Name || '')
          setState(po.State || '')
        }
      })
      .catch(() => {})
      .finally(() => setLookupLoading(false))
  }, [pincode])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setProfileSaving(true)
    setError('')
    setProfileSuccess('')
    try {
      const address = [building, street, city, state, pincode].join('|')
      await updateProfile({ name: name.trim(), phone: phone.trim() || null, address })
      setProfileSuccess('Profile updated')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { setError('Enter a new password'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setPasswordSaving(true)
    setError('')
    setPasswordSuccess('')
    try {
      const sb = createBrowserClient()
      const { error } = await sb.auth.updateUser({ password })
      if (error) throw error
      await updateProfile({ password_set: true }).catch(() => {})
      setPasswordSuccess('Password updated')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="font-serif text-2xl text-foreground mb-6">Admin Profile</h1>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-4">{error}</div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20 bg-primary/5">
            <Image
              src={avatarUrl || '/placeholder-user.jpg'}
              alt="Profile"
              fill
              className="object-cover"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              <CameraIcon />
            </button>
          </div>
          <div>
            <p className="font-medium text-foreground">{profile?.name || authEmail?.split('@')[0] || 'Admin'}</p>
            <p className="text-sm text-muted-foreground">{profile?.email || authEmail}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm text-primary font-medium hover:underline mt-1"
            >
              {uploading ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Profile Form */}
        <form onSubmit={handleProfileSave} className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-4 space-y-4">
          <h2 className="font-serif text-lg text-foreground">Personal Information</h2>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Door No / Building</label>
            <input
              type="text"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="Door number, building name"
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Street / Area</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street name, locality"
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Pincode</label>
            <div className="relative">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
              {lookupLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Email</label>
            <input
              type="email"
              value={authEmail}
              disabled
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={profileSaving}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-3 rounded-xl font-medium transition-colors"
          >
            {profileSaving ? 'Saving...' : 'Save Changes'}
          </button>

          {profileSuccess && (
            <p className="text-green-600 text-sm text-center">{profileSuccess}</p>
          )}
        </form>

        {/* School Address for Billing/Shipping */}
        <form className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-4 space-y-4">
          <h2 className="font-serif text-lg text-foreground">School Address (Sender for Billing & Shipping)</h2>
          <p className="text-sm text-muted-foreground">This address appears on invoices, shipping labels, and product sender details.</p>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">School Name</label>
            <input
              type="text"
              value="Srinatha Yoga School"
              disabled
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98865 12083"
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Email</label>
              <input
                type="email"
                value={authEmail}
                disabled
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Address</label>
            <textarea
              value={[building, street, city, state, pincode].filter(Boolean).join(', ')}
              onChange={(e) => {
                const parts = e.target.value.split(',').map(p => p.trim())
                if (parts[0]) setBuilding(parts[0])
                if (parts[1]) setStreet(parts[1])
                if (parts[2]) setCity(parts[2])
                if (parts[3]) setState(parts[3])
                if (parts[4]) setPincode(parts[4])
              }}
              placeholder="Building, Street, City, State, Pincode"
              rows={3}
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Pincode</label>
            <div className="relative">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
              {lookupLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </form>

        {/* Password Section */}
        <form onSubmit={handlePasswordSave} className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-4 space-y-4">
          <h2 className="font-serif text-lg text-foreground">Password</h2>
          <p className="text-sm text-muted-foreground">Set or change your password to login with email and password.</p>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              minLength={6}
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              minLength={6}
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-3 rounded-xl font-medium transition-colors"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>

          {passwordSuccess && (
            <p className="text-green-600 text-sm text-center">{passwordSuccess}</p>
          )}
        </form>

        {/* Footer */}
        <div className="px-4 text-center pt-6 pb-4">
          <p className="text-xs font-medium text-foreground">Srinatha Yoga School</p>
          <p className="text-xs text-muted-foreground mt-1">Mysore, Karnataka, India</p>
          <p className="text-xs text-muted-foreground mt-0.5">+91 98865 12083</p>
          <p className="text-[10px] text-muted-foreground/60 mt-3">Version 1.0.0</p>
          <a
            href="https://wa.me/918722163256?text=Hi%20Socialeo%2C%20I%20would%20like%20to%20get%20my%20website%20built.%20Please%20share%20more%20details."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-muted-foreground/20 text-muted-foreground/60 text-[10px] font-medium rounded-lg hover:bg-muted-foreground/10 hover:text-muted-foreground transition-all whitespace-nowrap mt-2"
          >
            Built with <span className="text-red-500">❤️</span> by Socialeo
          </a>
        </div>
      </div>
    </div>
  )
}

function CameraIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
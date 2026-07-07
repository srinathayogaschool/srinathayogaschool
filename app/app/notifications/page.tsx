'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, ChevronLeft } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { getNotifications, markNotificationRead } from '@/lib/supabase-queries'
import type { Database } from '@/lib/supabase-types'

type Notification = Database['public']['Tables']['notifications']['Row']

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentProfile().then(async p => {
      if (!p) return
      const data = await getNotifications(p.id)
      setNotifications(data)
      setLoading(false)
    })
  }, [])

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#264020] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#264020]/60 hover:text-[#264020] text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-[#264020]" />
          <h1 className="font-serif text-2xl text-[#264020]">Notifications</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-[#264020]/20 mx-auto mb-4" />
            <p className="text-[#264020]/60">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                className={`bg-white rounded-xl p-4 border cursor-pointer transition-colors ${
                  n.read ? 'border-[#E5E5E5] opacity-70' : 'border-[#264020]/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!n.read && <div className="w-2 h-2 bg-[#264020] rounded-full mt-2 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="font-medium text-sm text-[#264020]">{n.title}</p>
                    <p className="text-sm text-[#264020]/60 mt-1">{n.body}</p>
                    <p className="text-xs text-[#264020]/40 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

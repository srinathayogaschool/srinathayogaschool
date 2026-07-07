'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { getAllUsers } from '@/lib/supabase-queries'
import { getCurrentProfile } from '@/lib/auth'
import type { Database } from '@/lib/supabase-types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentProfile().then(async p => {
      if (!p || p.role !== 'admin') return
      const data = await getAllUsers()
      setUsers(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6" style={{ color: 'var(--admin-users)' }} />
        <h1 className="font-serif text-xl text-foreground">Users</h1>
        <span className="text-sm text-muted-foreground">({users.length})</span>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4 hidden md:table-cell">Phone</th>
              <th className="text-left p-4 hidden md:table-cell">Role</th>
              <th className="text-left p-4 hidden md:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-xs font-medium text-foreground">{u.name?.charAt(0) || '?'}</div>
                    <span className="font-medium text-foreground">{u.name || '—'}</span>
                  </div>
                </td>
                <td className="p-4 text-foreground/80">{u.email}</td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">{u.phone || '—'}</td>
                <td className="p-4 hidden md:table-cell">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.role === 'admin' ? 'bg-green-50 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

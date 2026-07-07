'use client'

import { useState, useEffect } from 'react'
import { ScrollText } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { getAuditLogs } from '@/lib/supabase-queries'
import type { AuditLog, Profile } from '@/lib/supabase-types'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<(AuditLog & { profiles?: Profile })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentProfile().then(async p => {
      if (!p || p.role !== 'admin') return
      const data = await getAuditLogs()
      setLogs(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ScrollText className="w-6 h-6" style={{ color: 'var(--admin-audit)' }} />
        <h1 className="font-serif text-xl text-foreground">Audit Logs</h1>
        <span className="text-sm text-muted-foreground">({logs.length})</span>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Action</th>
                <th className="text-left p-4 hidden md:table-cell">Table</th>
                <th className="text-left p-4 hidden md:table-cell">Details</th>
                <th className="text-right p-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="p-4">
                    <span className="text-foreground/80">{log.profiles?.name || 'Unknown'}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-secondary rounded text-xs text-muted-foreground">{log.action}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">{log.table_name}</td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground max-w-xs truncate">{log.details || '—'}</td>
                  <td className="p-4 text-right text-muted-foreground text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No audit logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

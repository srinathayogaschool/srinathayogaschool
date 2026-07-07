'use client'

import { useState, useEffect } from 'react'
import { PhoneCall, Search, CheckCircle, Archive, MessageCircle } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { getLeads, updateLead } from '@/lib/supabase-queries'
import type { Lead } from '@/lib/supabase-types'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filtered, setFiltered] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'new' | 'followed' | 'archived'>('all')

  useEffect(() => {
    getCurrentProfile().then(async p => {
      if (!p || p.role !== 'admin') return
      const data = await getLeads()
      setLeads(data)
      setFiltered(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = [...leads]
    if (filter === 'new') result = result.filter(l => !l.followed_up && !l.archived)
    else if (filter === 'followed') result = result.filter(l => l.followed_up && !l.archived)
    else if (filter === 'archived') result = result.filter(l => l.archived)
    if (search) result = result.filter(l =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.message.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [search, filter, leads])

  const handleFollowUp = async (id: string) => {
    const lead = leads.find(l => l.id === id)
    if (!lead) return
    await updateLead(id, { followed_up: !lead.followed_up })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, followed_up: !l.followed_up } : l))
  }

  const handleArchive = async (id: string) => {
    const lead = leads.find(l => l.id === id)
    if (!lead) return
    await updateLead(id, { archived: !lead.archived })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, archived: !l.archived } : l))
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <PhoneCall className="w-6 h-6" style={{ color: 'var(--admin-leads)' }} />
        <h1 className="font-serif text-xl text-foreground">Leads CRM</h1>
        <span className="text-sm text-muted-foreground">({filtered.length})</span>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 bg-card rounded-xl border border-border text-foreground text-sm"
          />
        </div>
        {(['all', 'new', 'followed', 'archived'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm capitalize ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(lead => (
          <div key={lead.id} className={`bg-card rounded-xl p-5 border ${lead.archived ? 'border-border/30 opacity-60' : 'border-border'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-semibold">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{lead.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{lead.email}</span>
                      {lead.phone && <span>{lead.phone}</span>}
                    </div>
                  </div>
                </div>
                {lead.subject && <p className="text-sm text-foreground/80 font-medium">{lead.subject}</p>}
                <p className="text-sm text-muted-foreground mt-1">{lead.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(lead.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleFollowUp(lead.id)}
                  className={`p-2 rounded-lg ${lead.followed_up ? 'bg-green-50 text-green-700' : 'bg-secondary text-muted-foreground'} hover:bg-green-100`}
                  title={lead.followed_up ? 'Mark not followed up' : 'Mark followed up'}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleArchive(lead.id)}
                  className={`p-2 rounded-lg ${lead.archived ? 'bg-amber-50 text-amber-700' : 'bg-secondary text-muted-foreground'} hover:bg-amber-100`}
                  title={lead.archived ? 'Unarchive' : 'Archive'}
                >
                  <Archive className="w-4 h-4" />
                </button>
                <a
                  href={`mailto:${lead.email}`}
                  className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-foreground"
                  title="Send email"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No leads found.</div>
        )}
      </div>
    </div>
  )
}

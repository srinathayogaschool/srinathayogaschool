'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Megaphone } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentProfile } from '@/lib/auth'
import type { Database } from '@/lib/supabase-types'

type Announcement = Database['public']['Tables']['announcements']['Row']

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', image: '', date: new Date().toISOString().split('T')[0], active: true })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const p = await getCurrentProfile()
    if (!p || p.role !== 'admin') return
    const sb = createBrowserClient()
    const { data } = await sb.from('announcements').select('*').order('date', { ascending: false })
    if (data) setAnnouncements(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ title: '', description: '', image: '', date: new Date().toISOString().split('T')[0], active: true })
    setEditing(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const sb = createBrowserClient()
    if (editing) {
      await sb.from('announcements').update(form).eq('id', editing.id)
    } else {
      await sb.from('announcements').insert(form)
    }
    setSaving(false)
    resetForm()
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    const sb = createBrowserClient()
    await sb.from('announcements').delete().eq('id', id)
    load()
  }

  const handleToggle = async (id: string, active: boolean) => {
    const sb = createBrowserClient()
    await sb.from('announcements').update({ active: !active }).eq('id', id)
    load()
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Megaphone className="w-6 h-6" style={{ color: 'var(--admin-announcements)' }} />
          <h1 className="font-serif text-xl text-foreground">Announcements</h1>
          <span className="text-sm text-muted-foreground">({announcements.length})</span>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90"><Plus className="w-4 h-4" /> Add</button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <h2 className="font-serif text-foreground mb-4">{editing ? 'Edit Announcement' : 'New Announcement'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Image URL</label>
              <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
              <span className="text-sm text-muted-foreground">Active</span>
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={resetForm} className="px-6 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4 hidden md:table-cell">Date</th>
              <th className="text-center p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map(a => (
              <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/50">
                <td className="p-4">
                  <p className="font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>
                </td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">{new Date(a.date).toLocaleDateString()}</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleToggle(a.id, a.active)} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${a.active ? 'bg-green-50 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                    {a.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {a.active ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditing(a); setForm({ title: a.title, description: a.description, image: a.image, date: a.date.split('T')[0], active: a.active }); setShowForm(true) }} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No announcements yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

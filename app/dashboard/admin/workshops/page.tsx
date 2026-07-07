'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Calendar } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentProfile } from '@/lib/auth'
import type { Database } from '@/lib/supabase-types'

type Workshop = Database['public']['Tables']['workshops']['Row']

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Workshop | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', image: '', start_date: '', duration: '1 Day',
    language: 'English', price: 0, instructor: '', format: 'Online Live',
    seat_limit: 20, seats_remaining: 20, active: true, starts_in: 30,
  })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const p = await getCurrentProfile()
    if (!p || p.role !== 'admin') return
    const sb = createBrowserClient()
    const { data } = await sb.from('workshops').select('*').order('start_date', { ascending: true })
    if (data) setWorkshops(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ title: '', description: '', image: '', start_date: '', duration: '1 Day', language: 'English', price: 0, instructor: '', format: 'Online Live', seat_limit: 20, seats_remaining: 20, active: true, starts_in: 30 })
    setEditing(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const sb = createBrowserClient()
    if (editing) {
      await sb.from('workshops').update(form).eq('id', editing.id)
    } else {
      await sb.from('workshops').insert(form)
    }
    setSaving(false)
    resetForm()
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workshop?')) return
    const sb = createBrowserClient()
    await sb.from('workshops').delete().eq('id', id)
    load()
  }

  const handleToggle = async (id: string, active: boolean) => {
    const sb = createBrowserClient()
    await sb.from('workshops').update({ active: !active }).eq('id', id)
    load()
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6" style={{ color: 'var(--admin-workshops)' }} />
          <h1 className="font-serif text-xl text-foreground">Workshops</h1>
          <span className="text-sm text-muted-foreground">({workshops.length})</span>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90"><Plus className="w-4 h-4" /> Add Workshop</button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <h2 className="font-serif text-foreground mb-4">{editing ? 'Edit Workshop' : 'New Workshop'}</h2>
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
              <label className="block text-sm text-muted-foreground mb-1">Instructor</label>
              <input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Duration</label>
              <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Price</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Format</label>
              <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background">
                <option>Online Live</option>
                <option>In-Person</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Seat Limit</label>
              <input type="number" value={form.seat_limit} onChange={e => setForm(f => ({ ...f, seat_limit: Number(e.target.value) }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                <span className="text-sm text-muted-foreground">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={resetForm} className="px-6 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm hover:bg-secondary/80">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-4">Workshop</th>
              <th className="text-left p-4 hidden md:table-cell">Date</th>
              <th className="text-left p-4 hidden md:table-cell">Instructor</th>
              <th className="text-left p-4 hidden md:table-cell">Seats</th>
              <th className="text-center p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workshops.map(w => (
              <tr key={w.id} className="border-b border-border/50 hover:bg-secondary/50">
                <td className="p-4">
                  <p className="font-medium text-foreground">{w.title}</p>
                </td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">{new Date(w.start_date).toLocaleDateString()}</td>
                <td className="p-4 hidden md:table-cell text-foreground/80">{w.instructor}</td>
                <td className="p-4 hidden md:table-cell text-foreground/80">{w.seats_remaining}/{w.seat_limit}</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleToggle(w.id, w.active)} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${w.active ? 'bg-green-50 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                    {w.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {w.active ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditing(w); setForm({ title: w.title, description: w.description, image: w.image, start_date: w.start_date.split('T')[0], duration: w.duration, language: w.language, price: w.price, instructor: w.instructor, format: w.format, seat_limit: w.seat_limit, seats_remaining: w.seats_remaining, active: w.active, starts_in: w.starts_in }); setShowForm(true) }} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(w.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {workshops.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No workshops yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

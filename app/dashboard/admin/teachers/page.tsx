'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Award } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentProfile } from '@/lib/auth'
import type { Database } from '@/lib/supabase-types'

type Teacher = Database['public']['Tables']['teachers']['Row']

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', image: '', specialization: '', bio: '', active: true })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const p = await getCurrentProfile()
    if (!p || p.role !== 'admin') return
    const sb = createBrowserClient()
    const { data } = await sb.from('teachers').select('*').order('created_at', { ascending: true })
    if (data) setTeachers(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ name: '', role: '', image: '', specialization: '', bio: '', active: true })
    setEditing(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const sb = createBrowserClient()
    if (editing) {
      await sb.from('teachers').update(form).eq('id', editing.id)
    } else {
      await sb.from('teachers').insert(form)
    }
    setSaving(false)
    resetForm()
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this teacher?')) return
    const sb = createBrowserClient()
    await sb.from('teachers').delete().eq('id', id)
    load()
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6" style={{ color: 'var(--admin-teachers)' }} />
          <h1 className="font-serif text-xl text-foreground">Teachers</h1>
          <span className="text-sm text-muted-foreground">({teachers.length})</span>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90"><Plus className="w-4 h-4" /> Add</button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <h2 className="font-serif text-foreground mb-4">{editing ? 'Edit Teacher' : 'New Teacher'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Role</label>
              <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Specialization</label>
              <input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Image URL</label>
              <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="/teachers/name.webp" className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <label className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teachers.map(t => (
          <div key={t.id} className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-secondary rounded-xl overflow-hidden flex-shrink-0">
                {t.image && <img src={t.image} alt={t.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.role}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.specialization}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className={`px-2 py-0.5 rounded-full text-xs ${t.active ? 'bg-green-50 text-green-700' : 'bg-secondary text-muted-foreground'}`}>{t.active ? 'Active' : 'Inactive'}</span>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(t); setForm({ name: t.name, role: t.role, image: t.image, specialization: t.specialization, bio: t.bio, active: t.active }); setShowForm(true) }} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {teachers.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground">No teachers yet.</div>}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { LayoutPanelTop, Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '@/lib/supabase-queries'
import type { Banner } from '@/lib/supabase-types'

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', cta_text: '', cta_link: '', sort_order: 0, active: true })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const p = await getCurrentProfile()
    if (!p || p.role !== 'admin') return
    const data = await getAllBanners()
    setBanners(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ title: '', subtitle: '', image: '', cta_text: '', cta_link: '', sort_order: banners.length, active: true })
    setEditing(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    setSaving(true)
    if (editing) {
      await updateBanner(editing.id, form)
    } else {
      await createBanner(form)
    }
    setSaving(false)
    resetForm()
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    await deleteBanner(id)
    load()
  }

  const handleToggle = async (id: string, active: boolean) => {
    await updateBanner(id, { active: !active })
    load()
  }

  const moveOrder = async (id: string, direction: 'up' | 'down') => {
    const idx = banners.findIndex(b => b.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === banners.length - 1) return
    const swap = direction === 'up' ? banners[idx - 1] : banners[idx + 1]
    const current = banners[idx]
    await Promise.all([
      updateBanner(current.id, { sort_order: swap.sort_order }),
      updateBanner(swap.id, { sort_order: current.sort_order }),
    ])
    load()
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutPanelTop className="w-6 h-6" style={{ color: 'var(--admin-banners)' }} />
          <h1 className="font-serif text-xl text-foreground">Banners</h1>
          <span className="text-sm text-muted-foreground">({banners.length})</span>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <h2 className="font-serif text-foreground mb-4">{editing ? 'Edit Banner' : 'New Banner'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Image URL *</label>
              <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">CTA Text</label>
              <input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">CTA Link</label>
              <input value={form.cta_link} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
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
            <button onClick={resetForm} className="px-6 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {banners.map((b, idx) => (
          <div key={b.id} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
            <div className="w-24 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
              {b.image && <img src={b.image} alt={b.title} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{b.title}</p>
              {b.subtitle && <p className="text-xs text-muted-foreground truncate">{b.subtitle}</p>}
              <p className="text-xs text-muted-foreground mt-1">Order: {b.sort_order}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => moveOrder(b.id, 'up')} disabled={idx === 0} className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
              <button onClick={() => moveOrder(b.id, 'down')} disabled={idx === banners.length - 1} className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleToggle(b.id, b.active)} className={`p-1.5 rounded-lg ${b.active ? 'text-green-600' : 'text-muted-foreground'}`}>
                {b.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle || '', image: b.image, cta_text: b.cta_text || '', cta_link: b.cta_link || '', sort_order: b.sort_order, active: b.active }); setShowForm(true) }} className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No banners yet.</div>
        )}
      </div>
    </div>
  )
}

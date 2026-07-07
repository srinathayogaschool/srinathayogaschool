'use client'

import { useState, useEffect } from 'react'
import { Image, Trash2, Search, Upload, Link2 } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { getMedia, deleteMedia, createMedia } from '@/lib/supabase-queries'
import type { Media } from '@/lib/supabase-types'

export default function MediaPage() {
  const [items, setItems] = useState<Media[]>([])
  const [filtered, setFiltered] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')

  useEffect(() => {
    getCurrentProfile().then(async p => {
      if (!p || p.role !== 'admin') return
      const data = await getMedia()
      setItems(data)
      setFiltered(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!search) { setFiltered(items); return }
    setFiltered(items.filter(m => (m.alt || '').toLowerCase().includes(search.toLowerCase()) || m.url.toLowerCase().includes(search.toLowerCase())))
  }, [search, items])

  const handleUpload = async () => {
    if (!url) return
    const p = await getCurrentProfile()
    await createMedia({ url, alt: alt || null, type: 'image', created_by: p?.id || null })
    setUrl('')
    setAlt('')
    setShowUpload(false)
    const data = await getMedia()
    setItems(data)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media?')) return
    await deleteMedia(id)
    setItems(prev => prev.filter(m => m.id !== id))
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image className="w-6 h-6" style={{ color: 'var(--admin-media)' }} />
          <h1 className="font-serif text-xl text-foreground">Media Library</h1>
          <span className="text-sm text-muted-foreground">({items.length})</span>
        </div>
        <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90">
          <Upload className="w-4 h-4" /> Add Media
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search media..." className="w-full pl-10 pr-4 py-2 bg-card rounded-xl border border-border text-foreground text-sm" />
      </div>

      {showUpload && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-6">
          <h2 className="font-serif text-foreground mb-4">Add Media URL</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Image URL</label>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Alt Text</label>
              <input value={alt} onChange={e => setAlt(e.target.value)} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleUpload} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90">Add</button>
              <button onClick={() => setShowUpload(false)} className="px-6 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-card rounded-xl border border-border overflow-hidden group">
            <div className="aspect-square bg-secondary relative">
              <img src={item.url} alt={item.alt || ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => copyUrl(item.url)} className="p-2 bg-white/20 rounded-lg hover:bg-white/40" title="Copy URL">
                  <Link2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/80 rounded-lg hover:bg-red-500" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs text-muted-foreground truncate">{item.alt || 'No alt text'}</p>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No media found. Click "Add Media" to upload.</div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Package, History } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentProfile } from '@/lib/auth'
import { getInventoryLogs, createInventoryLog } from '@/lib/supabase-queries'
import type { Database, InventoryLog } from '@/lib/supabase-types'

type Product = Database['public']['Tables']['products']['Row']

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', full_description: '', slug: '', short_description: '', image: '',
    price: 0, original_price: 0, stock: 10, sku: '',
    featured: false, active: true,
    meta_title: '', meta_description: '', og_image: '',
  })
  const [saving, setSaving] = useState(false)
  const [inventoryLog, setInventoryLog] = useState<InventoryLog[]>([])
  const [showLog, setShowLog] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  const load = async () => {
    const p = await getCurrentProfile()
    if (!p || p.role !== 'admin') return
    const sb = createBrowserClient()
    const [prodData, catData] = await Promise.all([
      sb.from('products').select('*').order('created_at', { ascending: false }),
      sb.from('categories').select('id, name').eq('type', 'product'),
    ])
    if (prodData.data) setProducts(prodData.data)
    if (catData.data) setCategories(catData.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ title: '', description: '', full_description: '', slug: '', short_description: '', image: '', price: 0, original_price: 0, stock: 10, sku: '', featured: false, active: true, meta_title: '', meta_description: '', og_image: '' })
    setEditing(null)
    setShowForm(false)
    setShowLog(null)
  }

  const handleSave = async () => {
    setSaving(true)
    const sb = createBrowserClient()
    const user = await getCurrentProfile()
    if (editing) {
      const oldStock = editing.stock
      await sb.from('products').update(form).eq('id', editing.id)
      if (form.stock !== oldStock) {
        const change = form.stock - oldStock
        await createInventoryLog({
          product_id: editing.id,
          quantity_change: change,
          reason: change > 0 ? 'Stock adjustment (increase)' : 'Stock adjustment (decrease)',
          created_by: user?.id || null,
        })
      }
    } else {
      const { data } = await sb.from('products').insert({ ...form, in_stock: form.stock > 0, is_digital: false, rating: 0, reviews_count: 0 }).select().single()
      if (data && form.stock > 0) {
        await createInventoryLog({
          product_id: data.id,
          quantity_change: form.stock,
          reason: 'Initial stock',
          created_by: user?.id || null,
        })
      }
    }
    setSaving(false)
    resetForm()
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    const sb = createBrowserClient()
    await sb.from('products').delete().eq('id', id)
    load()
  }

  const handleToggle = async (id: string, active: boolean) => {
    const sb = createBrowserClient()
    await sb.from('products').update({ active: !active }).eq('id', id)
    load()
  }

  const viewLog = async (productId: string) => {
    const logs = await getInventoryLogs(productId)
    setInventoryLog(logs)
    setShowLog(productId)
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6" style={{ color: 'var(--admin-products)' }} />
          <h1 className="font-serif text-xl text-foreground">Products</h1>
          <span className="text-sm text-muted-foreground">({products.length})</span>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <h2 className="font-serif text-foreground mb-4">{editing ? 'Edit Product' : 'New Product'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">SKU</label>
              <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Short Description</label>
              <input value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Full Description</label>
              <textarea value={form.full_description} onChange={e => setForm(f => ({ ...f, full_description: e.target.value }))} rows={4} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Image URL</label>
              <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">OG Image</label>
              <input value={form.og_image} onChange={e => setForm(f => ({ ...f, og_image: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Price</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Orig. Price</label>
                <input type="number" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: Number(e.target.value) }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
              </div>
            </div>
            <div className="col-span-2 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-3">SEO & Meta</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Meta Title</label>
                  <input value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Meta Description</label>
                  <input value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                <span className="text-sm text-muted-foreground">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                <span className="text-sm text-muted-foreground">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={resetForm} className="px-6 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm hover:bg-secondary/80">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4 hidden md:table-cell">Price</th>
              <th className="text-left p-4 hidden md:table-cell">Stock</th>
              <th className="text-center p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/50">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.sku ? `SKU: ${p.sku}` : (p.slug || '—')}</p>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-foreground">₹{p.price.toLocaleString()}</span>
                  {p.original_price > 0 && <span className="text-muted-foreground line-through ml-2">₹{p.original_price.toLocaleString()}</span>}
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className={p.stock <= 5 && p.stock > 0 ? 'text-amber-600' : p.stock <= 0 ? 'text-red-600' : 'text-green-600'}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => handleToggle(p.id, p.active)} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${p.active ? 'bg-green-50 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                    {p.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {p.active ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => viewLog(p.id)} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-amber-600" title="Inventory Log">
                      <History className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditing(p); setForm({ title: p.title, description: p.description, full_description: p.full_description || '', slug: p.slug || '', short_description: p.short_description || '', image: p.image, price: p.price, original_price: p.original_price, stock: p.stock ?? 0, sku: p.sku || '', featured: p.featured, active: p.active, meta_title: p.meta_title || '', meta_description: p.meta_description || '', og_image: p.og_image || '' }); setShowForm(true) }} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No products yet. Click "Add Product" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showLog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowLog(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-lg w-full mx-4 border border-border" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif text-foreground mb-4">Inventory History</h3>
            {inventoryLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inventory changes recorded.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {inventoryLog.map(log => (
                  <div key={log.id} className="flex items-center justify-between text-sm p-2 bg-secondary rounded-lg">
                    <div>
                      <span className={log.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                      </span>
                      <span className="text-muted-foreground ml-2">{log.reason}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowLog(null)} className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm w-full hover:bg-secondary/80">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

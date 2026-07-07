'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentProfile } from '@/lib/auth'
import type { Database } from '@/lib/supabase-types'

type Course = Database['public']['Tables']['courses']['Row']
type Category = { id: string; name: string }

const levels = ['beginner', 'intermediate', 'advanced']

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Course | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', subtitle: '', description: '', image: '', duration: '',
    lessons_count: 0, level: 'beginner', category_id: '', price: 0,
    instructor: '', instructor_image: '', certificate_eligible: false, published: false,
  })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const p = await getCurrentProfile()
    if (!p || p.role !== 'admin') return
    const sb = createBrowserClient()
    const [courseData, catData] = await Promise.all([
      sb.from('courses').select('*').order('created_at', { ascending: false }),
      sb.from('categories').select('id, name').eq('type', 'course'),
    ])
    if (courseData.data) setCourses(courseData.data)
    if (catData.data) setCategories(catData.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ title: '', subtitle: '', description: '', image: '', duration: '', lessons_count: 0, level: 'beginner', category_id: '', price: 0, instructor: '', instructor_image: '', certificate_eligible: false, published: false })
    setEditing(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const sb = createBrowserClient()
    if (editing) {
      await sb.from('courses').update(form).eq('id', editing.id)
    } else {
      await sb.from('courses').insert(form)
    }
    setSaving(false)
    resetForm()
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return
    const sb = createBrowserClient()
    await sb.from('courses').delete().eq('id', id)
    load()
  }

  const handleToggle = async (id: string, published: boolean) => {
    const sb = createBrowserClient()
    await sb.from('courses').update({ published: !published }).eq('id', id)
    load()
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6" style={{ color: 'var(--admin-courses)' }} />
          <h1 className="font-serif text-xl text-foreground">Courses</h1>
          <span className="text-sm text-muted-foreground">({courses.length})</span>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <h2 className="font-serif text-foreground mb-4">{editing ? 'Edit Course' : 'New Course'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Image URL</label>
              <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Instructor Image URL</label>
              <input value={form.instructor_image} onChange={e => setForm(f => ({ ...f, instructor_image: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Duration (e.g. "8 Weeks")</label>
              <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Lessons Count</label>
              <input type="number" value={form.lessons_count} onChange={e => setForm(f => ({ ...f, lessons_count: Number(e.target.value) }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Level</label>
              <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary">
                {levels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Category</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Price (₹)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Instructor</label>
              <input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} className="w-full px-4 py-2 border border-input rounded-xl text-foreground bg-background focus:outline-none focus:border-primary" />
            </div>
            <div className="flex items-center gap-6 col-span-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.certificate_eligible} onChange={e => setForm(f => ({ ...f, certificate_eligible: e.target.checked }))} />
                <span className="text-sm text-foreground/80">Certificate Eligible</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                <span className="text-sm text-foreground/80">Published (visible to students)</span>
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
              <th className="text-left p-4">Course</th>
              <th className="text-left p-4 hidden md:table-cell">Instructor</th>
              <th className="text-left p-4 hidden md:table-cell">Level</th>
              <th className="text-left p-4 hidden md:table-cell">Price</th>
              <th className="text-center p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/50">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.subtitle || '—'}</p>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-foreground/80">{c.instructor || '—'}</td>
                <td className="p-4 hidden md:table-cell">
                  <span className="px-2 py-0.5 bg-secondary rounded text-xs text-muted-foreground capitalize">{c.level}</span>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-foreground">₹{Number(c.price).toLocaleString()}</span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => handleToggle(c.id, c.published)} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${c.published ? 'bg-green-50 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                    {c.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {c.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setEditing(c); setForm({ title: c.title, subtitle: c.subtitle, description: c.description, image: c.image, duration: c.duration, lessons_count: c.lessons_count, level: c.level, category_id: c.category_id || '', price: Number(c.price), instructor: c.instructor, instructor_image: c.instructor_image || '', certificate_eligible: c.certificate_eligible, published: c.published }); setShowForm(true) }} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No courses yet. Click "Add Course" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

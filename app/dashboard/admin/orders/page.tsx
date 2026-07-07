'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'
import { getAllOrders, updateOrderStatus } from '@/lib/supabase-queries'
import { getCurrentProfile } from '@/lib/auth'

interface OrderWithDetails {
  id: string
  user_id: string
  order_number: string | null
  total: number
  status: string
  order_status: string
  payment_status: string
  created_at: string
  profiles?: { name: string; email: string; phone: string } | null
  items?: any[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const p = await getCurrentProfile()
    if (!p || p.role !== 'admin') return
    const data = await getAllOrders()
    setOrders(data as OrderWithDetails[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id: string, status: string) => {
    await updateOrderStatus(id, status as any)
    load()
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    processing: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="w-6 h-6" style={{ color: 'var(--admin-orders)' }} />
        <h1 className="font-serif text-xl text-foreground">Orders</h1>
        <span className="text-sm text-muted-foreground">({orders.length})</span>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-mono text-sm text-muted-foreground">{order.order_number || order.id.slice(0, 8)}</p>
                <p className="font-medium text-foreground mt-1">{order.profiles?.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{order.profiles?.email}</p>
                {order.profiles?.phone && <p className="text-xs text-muted-foreground">{order.profiles.phone}</p>}
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.order_status] || 'bg-secondary text-muted-foreground'}`}>
                  {order.order_status || order.status}
                </span>
                <p className="text-lg font-bold text-foreground mt-2">₹{order.total.toLocaleString()}</p>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Items:</p>
                {order.items.map((item: any, i: number) => (
                  <p key={i} className="text-sm text-foreground/80">
                    {item.products?.title || item.courses?.title || item.workshops?.title || 'Item'} — ₹{item.price.toLocaleString()}
                  </p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</span>
              <div className="flex gap-2">
                {['pending', 'processing', 'completed', 'cancelled'].map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatus(order.id, s)}
                    className={`px-3 py-1 rounded-lg text-xs border ${
                      order.order_status === s
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/30'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && <div className="text-center py-12 text-muted-foreground">No orders yet.</div>}
      </div>
    </div>
  )
}

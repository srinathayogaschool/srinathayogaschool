'use client'

import { useState, useEffect } from 'react'
import { BarChart3, ShoppingBag, Users, Calendar } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { getOrderStats, getProductSales, getWorkshopAnalytics, getUserAnalytics } from '@/lib/supabase-queries'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 })
  const [sales, setSales] = useState<{ title: string; count: number; revenue: number }[]>([])
  const [workshopData, setWorkshopData] = useState({ totalWorkshops: 0, totalRegistrations: 0, attendanceRate: 0, popular: [] as { title: string; registrations: number; capacity: number }[] })
  const [userData, setUserData] = useState({ totalUsers: 0, admins: 0, teachers: 0, students: 0 })

  useEffect(() => {
    getCurrentProfile().then(async p => {
      if (!p || p.role !== 'admin') return
      const [o, s, w, u] = await Promise.all([
        getOrderStats(), getProductSales(), getWorkshopAnalytics(), getUserAnalytics(),
      ])
      setStats(o)
      setSales(s)
      setWorkshopData(w)
      setUserData(u)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6" style={{ color: 'var(--admin-analytics)' }} />
        <h1 className="font-serif text-xl text-foreground">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4" style={{ color: 'var(--admin-products)' }} />
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--admin-courses)' }} />
            <p className="text-sm text-muted-foreground">Revenue</p>
          </div>
          <p className="text-2xl font-bold text-foreground">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--admin-workshops)' }} />
            <p className="text-sm text-muted-foreground">Workshops</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{workshopData.totalWorkshops}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" style={{ color: 'var(--admin-users)' }} />
            <p className="text-sm text-muted-foreground">Users</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{userData.totalUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-serif text-foreground mb-4">Best Selling Products</h2>
          {sales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {sales.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80 truncate">{item.title}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{item.count} sold</span>
                    <span className="text-foreground">₹{item.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-serif text-foreground mb-4">Popular Workshops</h2>
          {workshopData.popular.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workshop data yet.</p>
          ) : (
            <div className="space-y-3">
              {workshopData.popular.map((w, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80 truncate">{w.title}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{w.registrations}/{w.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-serif text-foreground mb-4">User Distribution</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Students</span>
              <span className="font-medium text-foreground">{userData.students}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Teachers</span>
              <span className="font-medium text-foreground">{userData.teachers}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Admins</span>
              <span className="font-medium text-foreground">{userData.admins}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-serif text-foreground mb-4">Workshop Attendance</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Registrations</span>
              <span className="font-medium text-foreground">{workshopData.totalRegistrations}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Attendance Rate</span>
              <span className="font-medium text-green-600">{workshopData.attendanceRate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Order Value</span>
              <span className="font-medium text-foreground">₹{stats.avgOrderValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

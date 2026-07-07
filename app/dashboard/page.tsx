'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package, Calendar, Megaphone, Users, ShoppingBag,
  BookOpen, BarChart3, PhoneCall, Image, LayoutPanelTop,
  ScrollText, FileDown, Award, LogOut
} from 'lucide-react'
import { getCurrentProfile, signOut } from '@/lib/auth'
import { getOrderStats, getProductSales, getWorkshopAnalytics, getUserAnalytics } from '@/lib/supabase-queries'
import type { Profile } from '@/lib/supabase-types'

const modules = [
  { icon: Package, label: 'Products', href: '/dashboard/admin/products', token: '--admin-products' },
  { icon: Calendar, label: 'Workshops', href: '/dashboard/admin/workshops', token: '--admin-workshops' },
  { icon: Megaphone, label: 'Announcements', href: '/dashboard/admin/announcements', token: '--admin-announcements' },
  { icon: BookOpen, label: 'Courses', href: '/dashboard/admin/courses', token: '--admin-courses' },
  { icon: Users, label: 'Users', href: '/dashboard/admin/users', token: '--admin-users' },
  { icon: ShoppingBag, label: 'Orders', href: '/dashboard/admin/orders', token: '--admin-orders' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/admin/analytics', token: '--admin-analytics' },
  { icon: PhoneCall, label: 'Leads', href: '/dashboard/admin/leads', token: '--admin-leads' },
  { icon: Image, label: 'Media', href: '/dashboard/admin/media', token: '--admin-media' },
  { icon: LayoutPanelTop, label: 'Banners', href: '/dashboard/admin/banners', token: '--admin-banners' },
  { icon: ScrollText, label: 'Audit Logs', href: '/dashboard/admin/audit-logs', token: '--admin-audit' },
  { icon: FileDown, label: 'Export', href: '/dashboard/admin/export', token: '--admin-export' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 })
  const [sales, setSales] = useState<{ title: string; count: number; revenue: number }[]>([])
  const [workshopData, setWorkshopData] = useState({ totalWorkshops: 0, totalRegistrations: 0, attendanceRate: 0 })
  const [userData, setUserData] = useState({ totalUsers: 0, students: 0, teachers: 0, admins: 0 })

  useEffect(() => {
    getCurrentProfile().then(async p => {
      if (!p || p.role !== 'admin') {
        router.push('/dashboard/login')
        return
      }
      setProfile(p)
      const [o, s, w, u] = await Promise.all([
        getOrderStats(), getProductSales(), getWorkshopAnalytics(), getUserAnalytics(),
      ])
      if (o) setStats(o)
      if (s) setSales(s)
      if (w) setWorkshopData(w)
      if (u) setUserData(u)
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </div>

          <h2 className="font-serif text-lg text-foreground mb-4">Revenue Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-foreground">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4" style={{ color: 'var(--admin-products)' }} />
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
              </div>
              <p className="text-2xl font-bold text-foreground">₹{stats.avgOrderValue.toLocaleString()}</p>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-4 h-4" style={{ color: 'var(--admin-orders)' }} />
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" style={{ color: 'var(--admin-users)' }} />
                <p className="text-sm text-muted-foreground">Users</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{userData.totalUsers}</p>
            </div>
          </div>

          <h2 className="font-serif text-lg text-foreground mb-4">Management</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {modules.map(mod => (
              <Link
                key={mod.label}
                href={mod.href}
                className="bg-card rounded-2xl p-6 hover:border-primary/30 border border-border transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `var(${mod.token})` }}
                >
                  <mod.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-sm text-foreground">{mod.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">Manage {mod.label.toLowerCase()}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h3 className="font-serif text-sm text-foreground mb-3">Top Products</h3>
              {sales.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales data yet.</p>
              ) : (
                <div className="space-y-2">
                  {sales.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-foreground/80 truncate">{item.title}</span>
                      <span className="text-muted-foreground ml-2">{item.count} sold</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h3 className="font-serif text-sm text-foreground mb-3">Workshops</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80">Total</span>
                  <span className="font-medium text-foreground">{workshopData.totalWorkshops}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80">Registrations</span>
                  <span className="font-medium text-foreground">{workshopData.totalRegistrations}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80">Attendance Rate</span>
                  <span className="font-medium text-green-600">{workshopData.attendanceRate}%</span>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h3 className="font-serif text-sm text-foreground mb-3">Users</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80">Students</span>
                  <span className="font-medium text-foreground">{userData.students}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80">Teachers</span>
                  <span className="font-medium text-foreground">{userData.teachers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80">Admins</span>
                  <span className="font-medium text-foreground">{userData.admins}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

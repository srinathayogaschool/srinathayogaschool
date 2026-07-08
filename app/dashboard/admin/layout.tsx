'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Package, BookOpen, Calendar, Award,
  ShoppingBag, Image, Users, PhoneCall,
  Megaphone, BarChart3, Download, FileText,
  LogOut, Menu, X, ChevronRight, Bell, Home,
  Settings, User,
} from 'lucide-react'
import { signOut, getCurrentProfile } from '@/lib/auth'

const MODULES = [
  { group: 'Overview', items: [
    { href: '/dashboard', label: 'Dashboard', icon: Home, token: '--admin-dashboard' },
    { href: '/dashboard/admin/profile', label: 'Profile', icon: User, token: '--admin-profile' },
  ]},
  { group: 'Content', items: [
    { href: '/dashboard/admin/products', label: 'Products', icon: Package, token: '--admin-products' },
    { href: '/dashboard/admin/courses', label: 'Courses', icon: BookOpen, token: '--admin-courses' },
    { href: '/dashboard/admin/workshops', label: 'Workshops', icon: Calendar, token: '--admin-workshops' },
    { href: '/dashboard/admin/teachers', label: 'Teachers', icon: Award, token: '--admin-teachers' },
  ]},
  { group: 'Commerce', items: [
    { href: '/dashboard/admin/orders', label: 'Orders', icon: ShoppingBag, token: '--admin-orders' },
    { href: '/dashboard/admin/banners', label: 'Banners', icon: Image, token: '--admin-banners' },
  ]},
  { group: 'People', items: [
    { href: '/dashboard/admin/users', label: 'Users', icon: Users, token: '--admin-users' },
    { href: '/dashboard/admin/leads', label: 'Leads', icon: PhoneCall, token: '--admin-leads' },
  ]},
  { group: 'Engagement', items: [
    { href: '/dashboard/admin/announcements', label: 'Announcements', icon: Megaphone, token: '--admin-announcements' },
    { href: '/dashboard/admin/media', label: 'Media', icon: Image, token: '--admin-media' },
  ]},
  { group: 'Analytics', items: [
    { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3, token: '--admin-analytics' },
    { href: '/dashboard/admin/export', label: 'Export', icon: Download, token: '--admin-export' },
    { href: '/dashboard/admin/audit-logs', label: 'Audit Logs', icon: FileText, token: '--admin-audit' },
  ]},
] as const

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getCurrentProfile().then(p => {
      if (!p || p.role !== 'admin') {
        router.push('/dashboard/admin/login')
      }
    })
  }, [router])

  const closeDrawer = () => setMobileOpen(false)

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-card/80 backdrop-blur-md border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Admin navigation"
      >
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg">
            D
          </div>
          <span className="font-serif text-lg text-foreground">Srinathyogaschool Admin Panel</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {MODULES.map(({ group, items }) => (
            <div key={group}>
              <h3 className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group}
              </h3>
              <ul className="space-y-1">
                {items.map(({ href, label, icon: Icon, token }) => {
                  const isActive = pathname === href
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={closeDrawer}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="w-5 h-5 flex-shrink-0" style={{ color: `var(${token})` }}>
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="truncate">{label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border text-xs text-muted-foreground">
          v1.0.0
        </div>
      </aside>

      <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-background/95 backdrop-blur-md border-b border-border lg:left-64">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center gap-3 lg:gap-0">
            <button
              className="lg:hidden w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumb pathname={pathname} />
          </div>

          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              D
            </div>
            <button
              onClick={() => signOut()}
              className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors hidden sm:block"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16 min-h-screen bg-background lg:pl-64">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return (
      <nav className="flex items-center text-sm ml-3 lg:ml-0" aria-label="Breadcrumb">
        <span className="font-medium text-foreground">Dashboard</span>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm ml-3 lg:ml-0" aria-label="Breadcrumb">
      <Link href="/dashboard" className="text-foreground/50 hover:text-foreground transition-colors">
        Dashboard
      </Link>
      {segments.slice(2).map((segment, i) => {
        const isLast = i === segments.slice(2).length - 1
        const label = segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

        return (
          <span key={segment} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={`/${segments.slice(0, 2 + i + 1).join('/')}`} className="text-foreground/50 hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

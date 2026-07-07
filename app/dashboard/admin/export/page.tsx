'use client'

import { useState, useEffect } from 'react'
import { FileDown, Users, ShoppingBag, Package, PhoneCall } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { exportUsersCSV, exportOrdersCSV, exportProductsCSV, exportLeadsCSV } from '@/lib/supabase-queries'

export default function ExportPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentProfile().then(p => {
      if (!p || p.role !== 'admin') return
      setLoading(false)
    })
  }, [])

  const downloadCSV = async (filename: string, exporter: () => Promise<string>) => {
    const csv = await exporter()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exports = [
    { icon: Users, label: 'Users', filename: 'users.csv', exporter: exportUsersCSV, token: '--admin-users' },
    { icon: ShoppingBag, label: 'Orders', filename: 'orders.csv', exporter: exportOrdersCSV, token: '--admin-orders' },
    { icon: Package, label: 'Products', filename: 'products.csv', exporter: exportProductsCSV, token: '--admin-products' },
    { icon: PhoneCall, label: 'Leads', filename: 'leads.csv', exporter: exportLeadsCSV, token: '--admin-leads' },
  ]

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileDown className="w-6 h-6" style={{ color: 'var(--admin-export)' }} />
        <h1 className="font-serif text-xl text-foreground">Export Data</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exports.map(exp => (
          <button
            key={exp.label}
            onClick={() => downloadCSV(exp.filename, exp.exporter)}
            className="bg-card rounded-2xl p-6 border border-border hover:border-foreground/30 transition-all text-left group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: `var(${exp.token})` }}
            >
              <exp.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-medium text-lg text-foreground">Export {exp.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">Download {exp.filename}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

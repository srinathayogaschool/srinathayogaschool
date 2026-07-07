import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Srinatha Yoga School',
  description: 'Manage your yoga school - orders, products, courses, workshops, users and more.',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

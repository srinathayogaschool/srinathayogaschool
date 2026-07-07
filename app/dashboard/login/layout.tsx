import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'App Login | Srinatha Yoga School',
  description: 'Login to access your yoga courses, track progress, and join live sessions.',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

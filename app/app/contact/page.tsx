'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ChevronLeft, MessageCircle, Send } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'

const WHATSAPP_NUMBER = '918722163256'
const WHATSAPP_MESSAGE = 'Namaste, I would like to know more about Srinatha Yoga School.'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const sb = createBrowserClient()
      const { error: insertError } = await sb.from('contact_messages').insert({
        name, email, subject, message,
      })
      if (insertError) throw insertError
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#264020]/60 hover:text-[#264020] text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-[#264020]" />
          <h1 className="font-serif text-2xl text-[#264020]">Contact Us</h1>
        </div>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#25D366] text-white rounded-xl p-4 mb-6 hover:bg-[#128C7E] transition-colors"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-sm">Chat on WhatsApp</p>
            <p className="text-xs text-white/80">Quick response time ~5 min</p>
          </div>
          <Send className="w-4 h-4 ml-auto" />
        </a>

        {/* Contact Form */}
        {sent ? (
          <div className="bg-white rounded-2xl p-8 border border-[#E5E5E5] text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="font-serif text-xl text-[#264020] mb-2">Message Sent!</h2>
            <p className="text-sm text-[#264020]/60">We will get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E5E5E5] space-y-4">
            <h2 className="font-serif text-lg text-[#264020]">Send us a message</h2>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-[#264020] mb-2">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-[#264020] focus:outline-none focus:border-[#264020]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#264020] mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-[#264020] focus:outline-none focus:border-[#264020]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#264020] mb-2">Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-[#264020] focus:outline-none focus:border-[#264020]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#264020] mb-2">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4}
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-[#264020] focus:outline-none focus:border-[#264020] resize-none" />
            </div>
            <button type="submit" disabled={sending}
              className="w-full bg-[#264020] hover:bg-[#3a5a30] disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors">
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

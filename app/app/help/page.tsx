'use client'

import Link from 'next/link'
import { HelpCircle, ChevronLeft, BookOpen, MessageCircle, FileText } from 'lucide-react'

const helpItems = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Learn how to navigate the app, enroll in courses, and track your progress.',
  },
  {
    icon: MessageCircle,
    title: 'FAQs',
    description: 'Answers to commonly asked questions about courses, payments, and accounts.',
  },
  {
    icon: FileText,
    title: 'Support Guides',
    description: 'Detailed guides for troubleshooting common issues.',
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#264020]/60 hover:text-[#264020] text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6 text-[#264020]" />
          <h1 className="font-serif text-2xl text-[#264020]">Help & Support</h1>
        </div>

        <div className="space-y-4">
          {helpItems.map(item => (
            <div
              key={item.title}
              className="bg-white rounded-xl p-5 border border-[#E5E5E5] cursor-pointer hover:border-[#264020]/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#264020]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-[#264020]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#264020]">{item.title}</h3>
                  <p className="text-sm text-[#264020]/60 mt-1">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl p-6 border border-[#E5E5E5] text-center">
          <p className="text-sm text-[#264020]/60">Need more help?</p>
          <p className="text-sm text-[#264020]/60 mt-1">Contact us and we will get back to you.</p>
          <Link
            href="/app/contact"
            className="inline-block mt-4 px-6 py-3 bg-[#264020] text-white rounded-xl text-sm font-medium hover:bg-[#3a5a30] transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}

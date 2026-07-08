import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, subject, message } = await request.json()

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.service_role_secret!,
      { auth: { persistSession: false } }
    )

    const name = `${firstName} ${lastName || ''}`.trim()
    const { error } = await supabase.from('contact_messages').insert({
      name,
      email,
      subject: subject || '',
      message,
    })
    await supabase.from('leads').insert({
      name,
      email,
      subject: subject || '',
      message,
    }).select().maybeSingle()

    if (error) {
      console.error('Contact form error:', error)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createAdminClient } from '@lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (normalizedEmail.length > 254) {
      return NextResponse.json(
        { error: 'Email address is too long' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if user previously unsubscribed — don't force re-subscribe
    const { data: existing } = (await supabase
      .from('newsletter_subscribers')
      .select('subscribed')
      .eq('email', normalizedEmail)
      .maybeSingle()) as { data: { subscribed: boolean } | null }

    if (existing && existing.subscribed === false) {
      return NextResponse.json(
        {
          error:
            'This email was previously unsubscribed. Please contact support to re-subscribe.',
        },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email: normalizedEmail, subscribed: true },
        { onConflict: 'email' }
      )

    if (error) {
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV !== 'production'
              ? error.message
              : 'Failed to subscribe',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

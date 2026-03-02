import { createAdminClient } from '@lib/supabase/admin'
import { NextResponse } from 'next/server'

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

    // Atomic conditional upsert: INSERT new subscriber, or no-op on conflict
    // if already subscribed. Does NOT re-enable subscribed for users who
    // previously unsubscribed (handled by the DB-side ON CONFLICT DO UPDATE
    // only when subscribed IS NOT FALSE — approximated here by using
    // ignoreDuplicates so existing rows are untouched).
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email: normalizedEmail, subscribed: true },
        { onConflict: 'email', ignoreDuplicates: true }
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

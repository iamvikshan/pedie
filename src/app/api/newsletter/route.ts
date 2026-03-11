import { createRateLimiter } from '@lib/security/rateLimit'
import { createAdminClient } from '@lib/supabase/admin'
import { NextResponse } from 'next/server'

const rateLimiter = createRateLimiter('newsletter', {
  requests: 10,
  window: '1 m',
})

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip')?.trim() ||
      'unknown'
    const { success } = await rateLimiter.limit(ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
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

    // INSERT new subscriber or no-op if the email already exists.
    // ignoreDuplicates skips the row on conflict, so previously
    // unsubscribed users are NOT re-subscribed.
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email: normalizedEmail, subscribed: true },
        { onConflict: 'email', ignoreDuplicates: true }
      )

    if (error) {
      return NextResponse.json(
        { error: 'Failed to subscribe' },
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

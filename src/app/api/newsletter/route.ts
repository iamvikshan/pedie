import { NextResponse } from 'next/server'
import { createAdminClient } from '@lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (email.length > 254) {
      return NextResponse.json(
        { error: 'Email address is too long' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email, subscribed: true },
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

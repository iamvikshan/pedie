import { isEmail, isValidUsername, resolveUsername } from '@lib/auth/username'
import { createRateLimiter } from '@lib/security/rateLimit'
import { createAdminClient } from '@lib/supabase/admin'
import { NextResponse } from 'next/server'

const rateLimiter = createRateLimiter('signin', { requests: 5, window: '1 m' })

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { success } = await rateLimiter.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { identifier, password } = await request.json()
    if (
      !identifier ||
      !password ||
      typeof identifier !== 'string' ||
      typeof password !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      )
    }

    let email = identifier.trim()

    if (!isEmail(email)) {
      const normalized = email.toLowerCase()
      if (!isValidUsername(normalized)) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 400 }
        )
      }
      const resolved = await resolveUsername(normalized)
      if (!resolved) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 400 }
        )
      }
      email = resolved
    }

    // Admin client required: server-side signInWithPassword needs service_role
    // since there's no browser session/cookies to work with
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
  }
}

import { isValidUsername, resolveUsername } from '@lib/auth/username'
import { createRateLimiter } from '@lib/security/rateLimit'
import { NextResponse } from 'next/server'

const rateLimiter = createRateLimiter('resolve-username', {
  requests: 5,
  window: '1 m',
})

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const { success } = await rateLimiter.limit(ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const { username } = body

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    const normalized = username.toLowerCase().trim()
    if (!isValidUsername(normalized)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      )
    }

    await resolveUsername(normalized)

    return NextResponse.json({ status: 'received' })
  } catch {
    return NextResponse.json({ status: 'received' })
  }
}

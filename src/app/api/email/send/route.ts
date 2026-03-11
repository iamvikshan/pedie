import { getUser, isAdmin } from '@helpers/auth'
import { isEmailConfigured, sendEmail } from '@lib/email/gmail'
import { createRateLimiter } from '@lib/security/rateLimit'
import { NextResponse } from 'next/server'
import sanitize from 'sanitize-html'

const rateLimiter = createRateLimiter('email-send', {
  requests: 10,
  window: '1 m',
})

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { success } = await rateLimiter.limit(user.id)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const { to, subject, html } = body

    if (
      !to ||
      !subject ||
      !html ||
      typeof to !== 'string' ||
      typeof subject !== 'string' ||
      typeof html !== 'string'
    ) {
      return NextResponse.json(
        { error: 'to, subject, and html are required' },
        { status: 400 }
      )
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 503 }
      )
    }

    const sanitizedTo = sanitize(to as string, {
      allowedTags: [],
      allowedAttributes: {},
    })
    const sanitizedSubject = sanitize(subject as string, {
      allowedTags: [],
      allowedAttributes: {},
    })
    await sendEmail(sanitizedTo, sanitizedSubject, html as string)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin email send error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

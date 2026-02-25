import { NextResponse } from 'next/server'
import { getUser, isAdmin } from '@lib/auth/helpers'
import { sendEmail, isEmailConfigured } from '@lib/email/gmail'

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

    await sendEmail(to, subject, html)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin email send error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

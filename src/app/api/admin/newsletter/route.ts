import { NextResponse } from 'next/server'
import { getUser } from '@lib/auth/helpers'
import { isUserAdmin } from '@lib/auth/admin'
import { getNewsletterSubscribers, exportNewsletterCSV } from '@lib/data/admin'

export async function GET(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const exportParam = url.searchParams.get('export')

    if (exportParam === 'csv') {
      const csv = await exportNewsletterCSV()
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition':
            'attachment; filename="newsletter-subscribers.csv"',
        },
      })
    }

    const page = Math.max(
      1,
      Math.floor(Number(url.searchParams.get('page')) || 1)
    )
    const limit = Math.max(
      1,
      Math.min(100, Math.floor(Number(url.searchParams.get('limit')) || 10))
    )

    const result = await getNewsletterSubscribers({ page, limit })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

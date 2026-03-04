import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import { getAdminOrders } from '@data/admin'
import { NextResponse } from 'next/server'

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
    const status = url.searchParams.get('status') ?? undefined
    const search = url.searchParams.get('search') ?? undefined
    const page = Number(url.searchParams.get('page')) || 1
    const rawLimit = Number(url.searchParams.get('limit')) || 10
    const limit = Math.min(Math.max(rawLimit, 1), 100)

    const result = await getAdminOrders({ status, search, page, limit })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

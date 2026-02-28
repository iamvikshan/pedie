import { NextResponse } from 'next/server'
import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import { getAdminCustomers } from '@lib/data/admin'

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
    const search = url.searchParams.get('search') ?? undefined
    const role = url.searchParams.get('role') ?? undefined
    const page = Math.max(
      1,
      Math.floor(Number(url.searchParams.get('page')) || 1)
    )
    const rawLimit = Number(url.searchParams.get('limit')) || 10
    const limit = Math.min(Math.max(rawLimit, 1), 100)

    const result = await getAdminCustomers({ search, role, page, limit })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

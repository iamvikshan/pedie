import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import { getAdminCustomerDetail, updateUserRole } from '@lib/data/admin'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const detail = await getAdminCustomerDetail(id)

    if (!detail.profile) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(detail)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { role } = body

    if (!role || !['admin', 'customer'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role is required (admin or customer)' },
        { status: 400 }
      )
    }

    // Prevent admin from demoting themselves
    if (id === user.id && role === 'customer') {
      return NextResponse.json(
        { error: 'Cannot demote yourself' },
        { status: 400 }
      )
    }

    const profile = await updateUserRole(id, role)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Failed to update user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

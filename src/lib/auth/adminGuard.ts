import { getUser } from '@helpers/auth'
import { NextResponse } from 'next/server'
import { isUserAdmin } from './admin'

/**
 * Admin auth guard for API route handlers.
 *
 * Returns the authenticated admin user, or a NextResponse error.
 * Usage:
 * ```ts
 * const guard = await requireAdmin()
 * if (guard instanceof NextResponse) return guard
 * const user = guard  // authenticated admin User
 * ```
 */
export async function requireAdmin() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = await isUserAdmin(user.id)
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return user
}

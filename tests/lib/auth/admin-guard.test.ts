import { describe, expect, test, mock, beforeEach } from 'bun:test'
import { NextResponse } from 'next/server'

// Mock auth modules
mock.module('@helpers/auth', () => ({
  getUser: mock(() => null),
}))
mock.module('@lib/auth/admin', () => ({
  isUserAdmin: mock(() => false),
}))

import { requireAdmin } from '@lib/auth/adminGuard'
import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'

const mockGetUser = getUser as ReturnType<typeof mock>
const mockIsUserAdmin = isUserAdmin as ReturnType<typeof mock>

describe('requireAdmin', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
  })

  test('returns 401 when no user is authenticated', async () => {
    mockGetUser.mockResolvedValue(null)

    const result = await requireAdmin()

    expect(result).toBeInstanceOf(NextResponse)
    const body = await (result as NextResponse).json()
    expect(body.error).toBe('Unauthorized')
  })

  test('returns 403 when user is not admin', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })
    mockIsUserAdmin.mockResolvedValue(false)

    const result = await requireAdmin()

    expect(result).toBeInstanceOf(NextResponse)
    const body = await (result as NextResponse).json()
    expect(body.error).toBe('Forbidden')
  })

  test('returns user when admin', async () => {
    const adminUser = { id: 'admin-1', email: 'admin@test.com' }
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const result = await requireAdmin()

    expect(result).not.toBeInstanceOf(NextResponse)
    expect(result).toEqual(adminUser as unknown as typeof result)
  })
})

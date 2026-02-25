import { describe, test, expect, mock, beforeEach } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock the supabase admin client
const mockSingle = mock(() => ({ data: null, error: null }) as any)
const mockEq = mock(() => ({ single: mockSingle }) as any)
const mockSelect = mock(() => ({ eq: mockEq }) as any)
const mockFrom = mock(() => ({ select: mockSelect }) as any)

mock.module('@lib/supabase/admin', () => ({
  createAdminClient: mock(() => ({
    from: mockFrom,
  })),
}))

// Must import AFTER mock.module
const { isUserAdmin } = await import('@lib/auth/admin')

describe('isUserAdmin', () => {
  beforeEach(() => {
    mockSingle.mockReset()
    mockEq.mockReset()
    mockSelect.mockReset()
    mockFrom.mockReset()

    mockFrom.mockReturnValue({ select: mockSelect } as any)
    mockSelect.mockReturnValue({ eq: mockEq } as any)
    mockEq.mockReturnValue({ single: mockSingle } as any)
  })

  test('returns true when user has admin role', async () => {
    mockSingle.mockReturnValue({ data: { role: 'admin' }, error: null })

    const result = await isUserAdmin('admin-user-id')
    expect(result).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(mockSelect).toHaveBeenCalledWith('role')
    expect(mockEq).toHaveBeenCalledWith('id', 'admin-user-id')
  })

  test('returns false when user has customer role', async () => {
    mockSingle.mockReturnValue({ data: { role: 'customer' }, error: null })

    const result = await isUserAdmin('customer-user-id')
    expect(result).toBe(false)
  })

  test('returns false when user does not exist', async () => {
    mockSingle.mockReturnValue({ data: null, error: { message: 'not found' } })

    const result = await isUserAdmin('nonexistent-user-id')
    expect(result).toBe(false)
  })

  test('returns false when profile has no role field', async () => {
    mockSingle.mockReturnValue({ data: {}, error: null })

    const result = await isUserAdmin('user-without-role')
    expect(result).toBe(false)
  })
})

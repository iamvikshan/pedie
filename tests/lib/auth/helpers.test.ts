import { describe, test, expect, mock, beforeEach } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock the supabase server client
const mockSingle = mock(() => ({ data: null, error: null }) as any)
const mockEq = mock(() => ({ single: mockSingle }) as any)
const mockSelect = mock(() => ({ eq: mockEq }) as any)
const mockFrom = mock(() => ({ select: mockSelect }) as any)
const mockGetUser = mock(() =>
  Promise.resolve({ data: { user: null }, error: null } as any)
)
const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
}

mock.module('@lib/supabase/server', () => ({
  createClient: mock(() => Promise.resolve(mockSupabase)),
}))

// Must import AFTER mock.module
const { getUser, getProfile, isAdmin } = await import('@lib/auth/helpers')

describe('auth helpers', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockSingle.mockReset()
    mockEq.mockReset()
    mockSelect.mockReset()
    mockFrom.mockReset()

    mockFrom.mockReturnValue({ select: mockSelect } as any)
    mockSelect.mockReturnValue({ eq: mockEq } as any)
    mockEq.mockReturnValue({ single: mockSingle } as any)
  })

  describe('getUser', () => {
    test('returns null when no user is authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const user = await getUser()
      expect(user).toBeNull()
    })

    test('returns user object when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {},
      }
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const user = await getUser()
      expect(user).toEqual(mockUser as any)
      expect(user!.id).toBe('user-123')
    })
  })

  describe('getProfile', () => {
    test('returns null when no user is authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const profile = await getProfile()
      expect(profile).toBeNull()
    })

    test('returns profile when user is authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockProfile = {
        id: 'user-123',
        full_name: 'Test User',
        role: 'customer' as const,
        phone: null,
        avatar_url: null,
        address: null,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      }

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSingle.mockReturnValue({ data: mockProfile, error: null })

      const profile = await getProfile()
      expect(profile).toEqual(mockProfile)
      expect(mockFrom).toHaveBeenCalledWith('profiles')
    })
  })

  describe('isAdmin', () => {
    test('returns false when no user is authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await isAdmin()
      expect(result).toBe(false)
    })

    test('returns false for customer role', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSingle.mockReturnValue({
        data: { role: 'customer' },
        error: null,
      })

      const result = await isAdmin()
      expect(result).toBe(false)
    })

    test('returns true for admin role', async () => {
      const mockUser = { id: 'admin-123', email: 'admin@example.com' }
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSingle.mockReturnValue({
        data: { role: 'admin' },
        error: null,
      })

      const result = await isAdmin()
      expect(result).toBe(true)
    })
  })
})

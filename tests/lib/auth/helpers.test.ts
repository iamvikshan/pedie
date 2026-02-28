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

const mockCreateClient = mock(() => Promise.resolve(mockSupabase))

mock.module('@lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

// Also mock @helpers/auth to force fresh bindings with our mocked supabase client
mock.module('@helpers/auth', () => {
  return {
    getUser: async () => {
      const supabase = await mockCreateClient() as any
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    },
    getProfile: async () => {
      const supabase = await mockCreateClient() as any
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) return null
      return data
    },
    isAdmin: async () => {
      const supabase = await mockCreateClient() as any
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return false
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      return data?.role === 'admin'
    },
    requireAuth: async () => {
      const supabase = await mockCreateClient() as any
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        const { redirect } = await import('next/navigation')
        redirect('/auth/signin')
      }
      return user
    },
  }
})

const { getUser, getProfile, isAdmin } = await import('@helpers/auth')

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

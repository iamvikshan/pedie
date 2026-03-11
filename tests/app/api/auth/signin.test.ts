import { describe, expect, mock, test, beforeEach } from 'bun:test'

let rateLimitSuccess = true
mock.module('@lib/security/rateLimit', () => ({
  createRateLimiter: () => ({
    limit: async () => ({
      success: rateLimitSuccess,
      limit: 5,
      remaining: rateLimitSuccess ? 4 : 0,
      reset: 0,
    }),
  }),
}))

const mockSignIn = mock()
mock.module('@lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: { signInWithPassword: mockSignIn },
  }),
}))

const mockResolve = mock()
mock.module('@lib/auth/username', () => ({
  isEmail: (input: string) => input.includes('@'),
  isValidUsername: (input: string) =>
    /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(input) && input.length >= 3,
  resolveUsername: mockResolve,
}))

const { POST } = await import('@/app/api/auth/signin/route')

function jsonBody(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/signin', () => {
  beforeEach(() => {
    rateLimitSuccess = true
    mockSignIn.mockReset()
    mockResolve.mockReset()
  })

  test('authenticates with email', async () => {
    mockSignIn.mockResolvedValueOnce({
      data: {
        session: {
          access_token: 'at',
          refresh_token: 'rt',
          expires_in: 3600,
          expires_at: 99999,
        },
      },
      error: null,
    })

    const res = await POST(
      jsonBody({ identifier: 'user@test.com', password: 'pass123' })
    )
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.access_token).toBe('at')
    expect(data.refresh_token).toBe('rt')
  })

  test('authenticates with username', async () => {
    mockResolve.mockResolvedValueOnce('resolved@test.com')
    mockSignIn.mockResolvedValueOnce({
      data: {
        session: {
          access_token: 'at2',
          refresh_token: 'rt2',
          expires_in: 3600,
          expires_at: 99999,
        },
      },
      error: null,
    })

    const res = await POST(
      jsonBody({ identifier: 'johndoe', password: 'pass123' })
    )
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.access_token).toBe('at2')
  })

  test('returns generic error for invalid credentials', async () => {
    mockSignIn.mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    })

    const res = await POST(
      jsonBody({ identifier: 'user@test.com', password: 'wrong' })
    )
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('Invalid credentials')
  })

  test('never includes email in response', async () => {
    mockSignIn.mockResolvedValueOnce({
      data: {
        session: {
          access_token: 'at',
          refresh_token: 'rt',
          expires_in: 3600,
          expires_at: 99999,
        },
        user: { email: 'secret@test.com' },
      },
      error: null,
    })

    const res = await POST(
      jsonBody({ identifier: 'user@test.com', password: 'pass123' })
    )
    const text = await res.text()
    expect(text).not.toContain('secret@test.com')
  })

  test('returns 429 when rate limited', async () => {
    rateLimitSuccess = false

    const res = await POST(
      jsonBody({ identifier: 'user@test.com', password: 'pass123' })
    )
    expect(res.status).toBe(429)
    const data = await res.json()
    expect(data.error).toBe('Too many requests')
  })
})

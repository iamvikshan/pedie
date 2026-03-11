import { describe, expect, mock, test } from 'bun:test'
import { isValidUsername } from '@lib/auth/username'

// ── Mocks ──────────────────────────────────────────────────────────────────

mock.module('@lib/security/rateLimit', () => ({
  createRateLimiter: () => ({
    limit: async () => ({ success: true, limit: 5, remaining: 4, reset: 0 }),
  }),
}))

const mockResolveUsername = mock<(username: string) => Promise<string | null>>(
  () => Promise.resolve(null)
)

mock.module('@lib/auth/username', () => ({
  isValidUsername,
  resolveUsername: mockResolveUsername,
}))

const { POST } = await import('@/app/api/auth/resolve-username/route')

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(body?: unknown) {
  return new Request('http://localhost:3000/api/auth/resolve-username', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('POST /api/auth/resolve-username', () => {
  test('returns 400 for missing username', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Username required')
  })

  test('returns 400 for non-string username', async () => {
    const res = await POST(makeRequest({ username: 123 }))
    expect(res.status).toBe(400)
  })

  test('returns 400 for invalid format', async () => {
    const res = await POST(makeRequest({ username: 'AB' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid username format')
  })

  test('returns generic response for nonexistent username', async () => {
    mockResolveUsername.mockResolvedValueOnce(null)
    const res = await POST(makeRequest({ username: 'nobody' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('received')
    expect(data.email).toBeUndefined()
  })

  test('returns generic response for valid username without leaking email', async () => {
    mockResolveUsername.mockResolvedValueOnce('alice@example.com')
    const res = await POST(makeRequest({ username: 'alice' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('received')
    expect(data.email).toBeUndefined()
  })
})

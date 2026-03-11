import { describe, expect, mock, test } from 'bun:test'
import { isValidUsername } from '@lib/auth/username'

// ── Mocks ──────────────────────────────────────────────────────────────────

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

  test('returns 404 for nonexistent username', async () => {
    mockResolveUsername.mockResolvedValueOnce(null)
    const res = await POST(makeRequest({ username: 'nobody' }))
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('User not found')
  })

  test('returns email for valid username', async () => {
    mockResolveUsername.mockResolvedValueOnce('alice@example.com')
    const res = await POST(makeRequest({ username: 'alice' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.email).toBe('alice@example.com')
  })
})

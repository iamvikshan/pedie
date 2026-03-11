import { describe, expect, mock, test, beforeEach } from 'bun:test'

const mockUpsert = mock()
const mockFrom = mock(() => ({ upsert: mockUpsert }))

mock.module('@lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

const { POST } = await import('@/app/api/newsletter/route')

function jsonBody(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('Newsletter API', () => {
  beforeEach(() => {
    mockUpsert.mockReset()
    mockFrom.mockClear()
  })

  test('should accept valid email subscription', async () => {
    mockUpsert.mockResolvedValueOnce({ error: null })

    const res = await POST(jsonBody({ email: 'user@example.com' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('newsletter_subscribers')
  })

  test('should return opaque error message regardless of environment', async () => {
    // Simulate a Supabase error with a detailed message
    mockUpsert.mockResolvedValueOnce({
      error: { message: 'duplicate key value violates unique constraint' },
    })

    const res = await POST(jsonBody({ email: 'dup@example.com' }))
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data.error).toBe('Failed to subscribe')
    // Raw DB error must never leak to the client
    expect(data.error).not.toContain('duplicate')
    expect(data.error).not.toContain('constraint')
  })

  test('should reject missing email', async () => {
    const res = await POST(jsonBody({}))
    expect(res.status).toBe(400)
  })

  test('should reject invalid email format', async () => {
    const res = await POST(jsonBody({ email: 'not-an-email' }))
    expect(res.status).toBe(400)
  })
})

import { describe, test, expect, mock, beforeEach } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockSendEmail = mock(() => Promise.resolve())
const mockIsEmailConfigured = mock(() => true)

mock.module('@lib/email/gmail', () => ({
  sendEmail: mockSendEmail,
  isEmailConfigured: mockIsEmailConfigured,
}))

const mockGetUser = mock(() => Promise.resolve(null as any))
const mockIsAdmin = mock(() => Promise.resolve(false))

mock.module('@lib/auth/helpers', () => ({
  getUser: mockGetUser,
  isAdmin: mockIsAdmin,
}))

// Import AFTER mocking
const { POST } = await import('@/app/api/email/send/route')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('POST /api/email/send', () => {
  const validBody = {
    to: 'test@example.com',
    subject: 'Test Subject',
    html: '<p>Test Body</p>',
  }

  beforeEach(() => {
    mockSendEmail.mockClear()
    mockIsEmailConfigured.mockClear()
    mockGetUser.mockClear()
    mockIsAdmin.mockClear()
    mockIsEmailConfigured.mockReturnValue(true)
  })

  test('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  test('returns 403 when user is not admin', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1', email: 'user@test.com' })
    mockIsAdmin.mockResolvedValue(false)

    const request = new Request('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    const response = await POST(request)
    expect(response.status).toBe(403)
  })

  test('returns 400 when required fields are missing', async () => {
    mockGetUser.mockResolvedValue({ id: 'admin-1', email: 'admin@test.com' })
    mockIsAdmin.mockResolvedValue(true)

    const request = new Request('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'test@example.com' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  test('returns 503 when email is not configured', async () => {
    mockGetUser.mockResolvedValue({ id: 'admin-1', email: 'admin@test.com' })
    mockIsAdmin.mockResolvedValue(true)
    mockIsEmailConfigured.mockReturnValue(false)

    const request = new Request('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    const response = await POST(request)
    expect(response.status).toBe(503)
  })

  test('sends email and returns success for admin', async () => {
    mockGetUser.mockResolvedValue({ id: 'admin-1', email: 'admin@test.com' })
    mockIsAdmin.mockResolvedValue(true)

    const request = new Request('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)

    expect(mockSendEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Test Subject',
      '<p>Test Body</p>'
    )
  })

  test('returns 500 on send failure', async () => {
    mockGetUser.mockResolvedValue({ id: 'admin-1', email: 'admin@test.com' })
    mockIsAdmin.mockResolvedValue(true)
    mockSendEmail.mockRejectedValueOnce(new Error('Send failed'))

    const request = new Request('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
  })
})

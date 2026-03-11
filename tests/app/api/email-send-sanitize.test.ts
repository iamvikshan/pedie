import { describe, expect, mock, test, beforeEach } from 'bun:test'

mock.module('@lib/security/rateLimit', () => ({
  createRateLimiter: () => ({
    limit: async () => ({ success: true, limit: 10, remaining: 9, reset: 0 }),
  }),
}))

const mockSendEmail = mock()

mock.module('@helpers/auth', () => ({
  getUser: mock(() => ({ id: 'admin-1', email: 'admin@test.com' })),
  isAdmin: mock(() => true),
}))

mock.module('@lib/email/gmail', () => ({
  isEmailConfigured: () => true,
  sendEmail: mockSendEmail,
}))

const { POST } = await import('@/app/api/email/send/route')

function jsonBody(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('Email Send Sanitization', () => {
  beforeEach(() => {
    mockSendEmail.mockReset()
    mockSendEmail.mockResolvedValue(undefined)
  })

  test('sanitizes to and subject fields', async () => {
    await POST(
      jsonBody({
        to: '<script>alert("xss")</script>victim@test.com',
        subject: '<b>Hello</b> <script>x</script>World',
        html: '<h1>Body</h1>',
      })
    )

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    const [to, subject] = mockSendEmail.mock.calls[0]
    expect(to).not.toContain('<script>')
    expect(subject).not.toContain('<script>')
  })

  test('passes html unchanged', async () => {
    const rawHtml = '<h1>Welcome</h1><script>track()</script><p>Content</p>'
    await POST(
      jsonBody({
        to: 'user@test.com',
        subject: 'Test',
        html: rawHtml,
      })
    )

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    const [, , html] = mockSendEmail.mock.calls[0]
    expect(html).toBe(rawHtml)
  })
})

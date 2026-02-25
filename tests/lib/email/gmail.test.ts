import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockSend = mock(() => Promise.resolve({ data: { id: 'msg-123' } }))
const mockSetCredentials = mock()

mock.module('googleapis', () => ({
  google: {
    auth: {
      OAuth2: mock(
        () =>
          ({
            setCredentials: mockSetCredentials,
          }) as any
      ),
    },
    gmail: mock(() => ({
      users: {
        messages: {
          send: mockSend,
        },
      },
    })),
  },
}))

// Import AFTER mocking
const { sendEmail, isEmailConfigured } = await import('@lib/email/gmail')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('isEmailConfigured', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  test('returns true when all env vars are set', () => {
    process.env.GMAIL_CLIENT_ID = 'client-id'
    process.env.GMAIL_CLIENT_SECRET = 'client-secret'
    process.env.GMAIL_REFRESH_TOKEN = 'refresh-token'
    process.env.GMAIL_SENDER_EMAIL = 'sender@example.com'

    expect(isEmailConfigured()).toBe(true)
  })

  test('returns false when GMAIL_CLIENT_ID is missing', () => {
    delete process.env.GMAIL_CLIENT_ID
    process.env.GMAIL_CLIENT_SECRET = 'client-secret'
    process.env.GMAIL_REFRESH_TOKEN = 'refresh-token'
    process.env.GMAIL_SENDER_EMAIL = 'sender@example.com'

    expect(isEmailConfigured()).toBe(false)
  })

  test('returns false when GMAIL_CLIENT_SECRET is missing', () => {
    process.env.GMAIL_CLIENT_ID = 'client-id'
    delete process.env.GMAIL_CLIENT_SECRET
    process.env.GMAIL_REFRESH_TOKEN = 'refresh-token'
    process.env.GMAIL_SENDER_EMAIL = 'sender@example.com'

    expect(isEmailConfigured()).toBe(false)
  })

  test('returns false when GMAIL_REFRESH_TOKEN is missing', () => {
    process.env.GMAIL_CLIENT_ID = 'client-id'
    process.env.GMAIL_CLIENT_SECRET = 'client-secret'
    delete process.env.GMAIL_REFRESH_TOKEN
    process.env.GMAIL_SENDER_EMAIL = 'sender@example.com'

    expect(isEmailConfigured()).toBe(false)
  })

  test('returns false when GMAIL_SENDER_EMAIL is missing', () => {
    process.env.GMAIL_CLIENT_ID = 'client-id'
    process.env.GMAIL_CLIENT_SECRET = 'client-secret'
    process.env.GMAIL_REFRESH_TOKEN = 'refresh-token'
    delete process.env.GMAIL_SENDER_EMAIL

    expect(isEmailConfigured()).toBe(false)
  })

  test('returns false when env vars are empty strings', () => {
    process.env.GMAIL_CLIENT_ID = ''
    process.env.GMAIL_CLIENT_SECRET = 'client-secret'
    process.env.GMAIL_REFRESH_TOKEN = 'refresh-token'
    process.env.GMAIL_SENDER_EMAIL = 'sender@example.com'

    expect(isEmailConfigured()).toBe(false)
  })
})

describe('sendEmail', () => {
  beforeEach(() => {
    process.env.GMAIL_CLIENT_ID = 'client-id'
    process.env.GMAIL_CLIENT_SECRET = 'client-secret'
    process.env.GMAIL_REFRESH_TOKEN = 'refresh-token'
    process.env.GMAIL_SENDER_EMAIL = 'sender@example.com'
    mockSend.mockClear()
    mockSetCredentials.mockClear()
  })

  test('sends email via Gmail API', async () => {
    await sendEmail('test@example.com', 'Test Subject', '<p>Hello</p>')

    expect(mockSend).toHaveBeenCalledTimes(1)
    const callArgs = (mockSend.mock.calls as any[][])[0][0]
    expect(callArgs.userId).toBe('me')
    expect(callArgs.requestBody.raw).toBeDefined()
  })

  test('encodes email as base64url', async () => {
    await sendEmail('test@example.com', 'Test Subject', '<p>Hello</p>')

    const callArgs = (mockSend.mock.calls as any[][])[0][0]
    const raw = callArgs.requestBody.raw as string
    // base64url should not contain + / =
    expect(raw).not.toMatch(/[+/=]/)
  })

  test('includes correct headers in RFC 2822 message', async () => {
    await sendEmail('recipient@example.com', 'My Subject', '<p>Body</p>')

    const callArgs = (mockSend.mock.calls as any[][])[0][0]
    const raw = callArgs.requestBody.raw as string
    const decoded = Buffer.from(raw, 'base64url').toString('utf-8')

    expect(decoded).toContain('To: recipient@example.com')
    expect(decoded).toContain('From: sender@example.com')
    expect(decoded).toContain('Subject: My Subject')
    expect(decoded).toContain('Content-Type: text/html; charset=utf-8')
    expect(decoded).toContain('<p>Body</p>')
  })

  test('throws on send failure so callers can handle errors', async () => {
    mockSend.mockRejectedValueOnce(new Error('API Error'))

    await expect(
      sendEmail('test@example.com', 'Test', '<p>Hello</p>')
    ).rejects.toThrow('API Error')
  })

  test('sets OAuth2 credentials with refresh token', async () => {
    await sendEmail('test@example.com', 'Test', '<p>Hello</p>')

    expect(mockSetCredentials).toHaveBeenCalledWith({
      refresh_token: 'refresh-token',
    })
  })

  test('strips CR/LF from To header to prevent header injection', async () => {
    await sendEmail(
      'victim@example.com\r\nBcc: attacker@evil.com',
      'Test',
      '<p>Hello</p>'
    )

    const callArgs = (mockSend.mock.calls as any[][])[0][0]
    const raw = callArgs.requestBody.raw as string
    const decoded = Buffer.from(raw, 'base64url').toString('utf-8')

    expect(decoded).toContain('To: victim@example.comBcc: attacker@evil.com')
    expect(decoded).not.toContain('\r\nBcc:')
  })

  test('strips CR/LF from Subject header to prevent header injection', async () => {
    await sendEmail(
      'test@example.com',
      'Normal Subject\r\nBcc: attacker@evil.com',
      '<p>Hello</p>'
    )

    const callArgs = (mockSend.mock.calls as any[][])[0][0]
    const raw = callArgs.requestBody.raw as string
    const decoded = Buffer.from(raw, 'base64url').toString('utf-8')

    expect(decoded).toContain('Subject: Normal SubjectBcc: attacker@evil.com')
    expect(decoded).not.toMatch(/Subject:.*\r\nBcc:/)
  })
})

import { describe, test, expect, mock, beforeEach } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockSendEmail = mock(() => Promise.resolve())
const mockIsEmailConfigured = mock(() => true)

mock.module('@lib/email/gmail', () => ({
  sendEmail: mockSendEmail,
  isEmailConfigured: mockIsEmailConfigured,
}))

// Import helpers AFTER mocking gmail
const {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendPaymentConfirmation,
} = await import('@lib/email/send')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Email trigger: sendWelcomeEmail', () => {
  beforeEach(() => {
    mockSendEmail.mockClear()
    mockIsEmailConfigured.mockClear()
    mockIsEmailConfigured.mockReturnValue(true)
    mockSendEmail.mockResolvedValue(undefined)
  })

  test('passes correct arguments to sendEmail', async () => {
    await sendWelcomeEmail('alice@example.com', 'Alice')

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    const [to, subject, html] = (mockSendEmail.mock.calls as any[][])[0]
    expect(to).toBe('alice@example.com')
    expect(subject).toBe('Welcome to Pedie Tech!')
    expect(html).toContain('Welcome')
    expect(html).toContain('Alice')
  })

  test('does not call sendEmail when config is missing', async () => {
    mockIsEmailConfigured.mockReturnValue(false)

    await sendWelcomeEmail('test@example.com', 'Test')

    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  test('catches sendEmail errors without throwing', async () => {
    mockSendEmail.mockRejectedValueOnce(new Error('Gmail API down'))

    await expect(
      sendWelcomeEmail('test@example.com', 'Test')
    ).resolves.toBeUndefined()
  })

  test('escapes HTML in userName in the email body', async () => {
    await sendWelcomeEmail('test@example.com', '<script>alert(1)</script>')

    const [, , html] = (mockSendEmail.mock.calls as any[][])[0]
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('Email trigger: sendOrderConfirmation', () => {
  beforeEach(() => {
    mockSendEmail.mockClear()
    mockIsEmailConfigured.mockClear()
    mockIsEmailConfigured.mockReturnValue(true)
    mockSendEmail.mockResolvedValue(undefined)
  })

  const data = {
    userName: 'Bob',
    orderId: 'ORD-100',
    items: [
      { name: 'Widget', price: 1000 },
      { name: 'Gadget', price: 2000 },
    ],
    total: 3000,
    depositAmount: 500,
    paymentMethod: 'mpesa',
  }

  test('passes order details to sendEmail', async () => {
    await sendOrderConfirmation('bob@example.com', data)

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    const [to, subject, html] = (mockSendEmail.mock.calls as any[][])[0]
    expect(to).toBe('bob@example.com')
    expect(subject).toContain('ORD-100')
    expect(html).toContain('Bob')
    expect(html).toContain('Widget')
    expect(html).toContain('Gadget')
  })

  test('catches sendEmail errors without throwing', async () => {
    mockSendEmail.mockRejectedValueOnce(new Error('Network error'))

    await expect(
      sendOrderConfirmation('bob@example.com', data)
    ).resolves.toBeUndefined()
  })

  test('escapes HTML in item names', async () => {
    const xssData = {
      ...data,
      items: [{ name: '<img src=x onerror=alert(1)>', price: 500 }],
    }

    await sendOrderConfirmation('bob@example.com', xssData)

    const [, , html] = (mockSendEmail.mock.calls as any[][])[0]
    expect(html).not.toContain('<img src=x onerror=alert(1)>')
    expect(html).toContain('&lt;img')
  })

  test('does not call sendEmail when config is missing', async () => {
    mockIsEmailConfigured.mockReturnValue(false)

    await sendOrderConfirmation('bob@example.com', data)

    expect(mockSendEmail).not.toHaveBeenCalled()
  })
})

describe('Email trigger: sendPaymentConfirmation', () => {
  beforeEach(() => {
    mockSendEmail.mockClear()
    mockIsEmailConfigured.mockClear()
    mockIsEmailConfigured.mockReturnValue(true)
    mockSendEmail.mockResolvedValue(undefined)
  })

  const data = {
    userName: 'Carol',
    orderId: 'ORD-200',
    amount: 5000,
    paymentMethod: 'paypal',
    receiptNumber: 'RCP-99',
  }

  test('passes payment details to sendEmail', async () => {
    await sendPaymentConfirmation('carol@example.com', data)

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    const [to, subject, html] = (mockSendEmail.mock.calls as any[][])[0]
    expect(to).toBe('carol@example.com')
    expect(subject).toContain('Payment')
    expect(subject).toContain('ORD-200')
    expect(html).toContain('Carol')
    expect(html).toContain('RCP-99')
  })

  test('catches sendEmail errors without throwing', async () => {
    mockSendEmail.mockRejectedValueOnce(new Error('OAuth expired'))

    await expect(
      sendPaymentConfirmation('carol@example.com', data)
    ).resolves.toBeUndefined()
  })

  test('escapes HTML in receipt number', async () => {
    const xssData = { ...data, receiptNumber: '"><script>steal()</script>' }

    await sendPaymentConfirmation('carol@example.com', xssData)

    const [, , html] = (mockSendEmail.mock.calls as any[][])[0]
    expect(html).not.toContain('<script>steal()</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  test('does not call sendEmail when config is missing', async () => {
    mockIsEmailConfigured.mockReturnValue(false)

    await sendPaymentConfirmation('carol@example.com', data)

    expect(mockSendEmail).not.toHaveBeenCalled()
  })
})

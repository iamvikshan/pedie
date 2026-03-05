import { beforeEach, describe, expect, mock, test } from 'bun:test'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockSendEmail = mock(() => Promise.resolve())
const mockIsEmailConfigured = mock(() => true)

mock.module('@lib/email/gmail', () => ({
  sendEmail: mockSendEmail,
  isEmailConfigured: mockIsEmailConfigured,
}))

// Import AFTER mocking
const { sendWelcomeEmail, sendOrderConfirmation, sendPaymentConfirmation } =
  await import('@lib/email/send')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('sendWelcomeEmail', () => {
  beforeEach(() => {
    mockSendEmail.mockClear()
    mockIsEmailConfigured.mockClear()
    mockIsEmailConfigured.mockReturnValue(true)
  })

  test('sends welcome email with correct template', async () => {
    await sendWelcomeEmail('test@example.com', 'Alice')

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    const [to, subject, html] = (
      mockSendEmail.mock.calls as unknown[][]
    )[0] as [string, string, string]
    expect(to).toBe('test@example.com')
    expect(subject).toContain('Welcome')
    expect(html).toContain('Alice')
  })

  test('skips sending when email is not configured', async () => {
    mockIsEmailConfigured.mockReturnValue(false)

    await sendWelcomeEmail('test@example.com', 'Alice')

    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  test('does not throw on send failure', async () => {
    mockSendEmail.mockRejectedValueOnce(new Error('Send failed'))

    await expect(
      sendWelcomeEmail('test@example.com', 'Alice')
    ).resolves.toBeUndefined()
  })
})

describe('sendOrderConfirmation', () => {
  beforeEach(() => {
    mockSendEmail.mockClear()
    mockIsEmailConfigured.mockClear()
    mockIsEmailConfigured.mockReturnValue(true)
  })

  const data = {
    userName: 'Jane',
    orderId: 'ORD-001',
    items: [{ name: 'Phone', price: 50000 }],
    total: 50000,
    depositAmount: 2500,
    paymentMethod: 'mpesa',
  }

  test('sends order confirmation with correct template', async () => {
    await sendOrderConfirmation('jane@example.com', data)

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    const [to, subject, html] = (
      mockSendEmail.mock.calls as unknown[][]
    )[0] as [string, string, string]
    expect(to).toBe('jane@example.com')
    expect(subject).toContain('ORD-001')
    expect(html).toContain('Jane')
  })

  test('skips sending when email is not configured', async () => {
    mockIsEmailConfigured.mockReturnValue(false)

    await sendOrderConfirmation('jane@example.com', data)

    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  test('does not throw on send failure', async () => {
    mockSendEmail.mockRejectedValueOnce(new Error('Send failed'))

    await expect(
      sendOrderConfirmation('jane@example.com', data)
    ).resolves.toBeUndefined()
  })
})

describe('sendPaymentConfirmation', () => {
  beforeEach(() => {
    mockSendEmail.mockClear()
    mockIsEmailConfigured.mockClear()
    mockIsEmailConfigured.mockReturnValue(true)
  })

  const data = {
    userName: 'John',
    orderId: 'ORD-002',
    amount: 3500,
    paymentMethod: 'paypal',
    receiptNumber: 'RCP-12345',
  }

  test('sends payment confirmation with correct template', async () => {
    await sendPaymentConfirmation('john@example.com', data)

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    const [to, subject, html] = (
      mockSendEmail.mock.calls as unknown[][]
    )[0] as [string, string, string]
    expect(to).toBe('john@example.com')
    expect(subject).toContain('Payment')
    expect(html).toContain('John')
  })

  test('skips sending when email is not configured', async () => {
    mockIsEmailConfigured.mockReturnValue(false)

    await sendPaymentConfirmation('john@example.com', data)

    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  test('does not throw on send failure', async () => {
    mockSendEmail.mockRejectedValueOnce(new Error('Send failed'))

    await expect(
      sendPaymentConfirmation('john@example.com', data)
    ).resolves.toBeUndefined()
  })
})

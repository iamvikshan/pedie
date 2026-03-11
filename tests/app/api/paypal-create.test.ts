import { beforeEach, describe, expect, mock, test } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

mock.module('@lib/security/rateLimit', () => ({
  createRateLimiter: () => ({
    limit: async () => ({ success: true, limit: 5, remaining: 4, reset: 0 }),
  }),
}))

const mockGetOrderById = mock(() => Promise.resolve(null as any))
mock.module('@data/orders', () => ({
  getOrderById: mockGetOrderById,
  createOrder: mock(),
  updateOrderStatus: mock(),
}))

const mockCreatePayPalOrder = mock(() =>
  Promise.resolve({
    id: 'PAYPAL-123',
    status: 'CREATED',
    links: [{ rel: 'approve', href: 'https://paypal.com/approve' }],
  })
)
const mockGetApprovalUrl = mock(() => 'https://paypal.com/approve')
mock.module('@lib/payments/paypal', () => ({
  createPayPalOrder: mockCreatePayPalOrder,
  getApprovalUrl: mockGetApprovalUrl,
  capturePayPalPayment: mock(),
  getPayPalAccessToken: mock(),
  getPayPalOrderStatus: mock(),
  kesToUsd: mock(),
}))

const mockGetUser = mock(() => Promise.resolve({ id: 'user-123' } as any))
mock.module('@helpers/auth', () => ({
  getUser: mockGetUser,
}))

const { POST } = await import('@/app/api/payments/paypal/create/route')

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/payments/paypal/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('POST /api/payments/paypal/create (server-side pricing)', () => {
  beforeEach(() => {
    mockGetOrderById.mockReset()
    mockCreatePayPalOrder.mockReset()
    mockGetApprovalUrl.mockReset()
    mockGetUser.mockReset()
    mockGetUser.mockResolvedValue({ id: 'user-123' })
    mockCreatePayPalOrder.mockResolvedValue({
      id: 'PAYPAL-123',
      status: 'CREATED',
      links: [{ rel: 'approve', href: 'https://paypal.com/approve' }],
    })
    mockGetApprovalUrl.mockReturnValue('https://paypal.com/approve')
  })

  test('derives amount from order deposit_amount_kes, not client input', async () => {
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'pending',
      deposit_amount_kes: 5000,
      user_id: 'user-123',
      items: [],
    })

    const res = await POST(makeRequest({ orderId: 'order-123' }))
    expect(res.status).toBe(200)

    const callArg = (mockCreatePayPalOrder.mock.calls[0] as any[])[0]
    expect(callArg.amountKes).toBe(5000)
  })

  test('ignores client-supplied amountKes', async () => {
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'pending',
      deposit_amount_kes: 5000,
      user_id: 'user-123',
      items: [],
    })

    const res = await POST(
      makeRequest({ orderId: 'order-123', amountKes: 999999 })
    )
    expect(res.status).toBe(200)

    const callArg = (mockCreatePayPalOrder.mock.calls[0] as any[])[0]
    expect(callArg.amountKes).toBe(5000)
  })

  test('rejects if order not found', async () => {
    mockGetOrderById.mockResolvedValue(null)

    const res = await POST(makeRequest({ orderId: 'nonexistent' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Order not available')
  })

  test('rejects if order is not pending', async () => {
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'confirmed',
      deposit_amount_kes: 5000,
      user_id: 'user-123',
      items: [],
    })

    const res = await POST(makeRequest({ orderId: 'order-123' }))
    expect(res.status).toBe(400)
  })

  test('rejects if orderId is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  test('rejects unauthenticated requests', async () => {
    mockGetUser.mockResolvedValue(null)

    const res = await POST(makeRequest({ orderId: 'order-123' }))
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Unauthorized')
  })

  test('rejects if order belongs to another user', async () => {
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'pending',
      deposit_amount_kes: 5000,
      user_id: 'other-user-456',
      items: [],
    })

    const res = await POST(makeRequest({ orderId: 'order-123' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Order not available')
  })

  test('rejects zero deposit amount', async () => {
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'pending',
      deposit_amount_kes: 0,
      user_id: 'user-123',
      items: [],
    })

    const res = await POST(makeRequest({ orderId: 'order-123' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Order deposit amount must be positive')
  })
})

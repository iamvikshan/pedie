import { beforeEach, describe, expect, mock, test } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

mock.module('@lib/security/rateLimit', () => ({
  createRateLimiter: () => ({
    limit: async () => ({ success: true, limit: 5, remaining: 4, reset: 0 }),
  }),
}))

const mockGetUser = mock(() => Promise.resolve(null as any))
mock.module('@helpers/auth', () => ({ getUser: mockGetUser }))

const mockCreateOrder = mock(() =>
  Promise.resolve({
    id: 'order-123',
    status: 'pending',
    subtotal_kes: 50000,
    shipping_fee_kes: 0,
    total_kes: 50000,
    deposit_amount_kes: 2500,
    balance_due_kes: 47500,
  })
)
const mockGetOrderById = mock(() => Promise.resolve(null))
mock.module('@data/orders', () => ({
  createOrder: mockCreateOrder,
  getOrderById: mockGetOrderById,
}))

mock.module('@lib/email/send', () => ({
  sendOrderConfirmation: mock(() => Promise.resolve()),
}))

const { POST } = await import('@/app/api/orders/route')

// ── Helpers ────────────────────────────────────────────────────────────────

const authedUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
}

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validBody = {
  items: [{ listing_id: 'PD-ABC12', quantity: 1 }],
  shippingAddress: {
    full_name: 'John Doe',
    phone: '+254700000000',
    street: '123 Main St',
    city: 'Nairobi',
    county: 'Nairobi',
    country: 'Kenya',
  },
  paymentMethod: 'mpesa',
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('POST /api/orders (server-side pricing)', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockCreateOrder.mockReset()
    mockCreateOrder.mockResolvedValue({
      id: 'order-123',
      status: 'pending',
      subtotal_kes: 50000,
      shipping_fee_kes: 0,
      total_kes: 50000,
      deposit_amount_kes: 2500,
      balance_due_kes: 47500,
    } as any)
    mockGetOrderById.mockReset()
  })

  test('accepts only listing_id and quantity in items', async () => {
    mockGetUser.mockResolvedValue(authedUser)

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)

    const callArg = (mockCreateOrder.mock.calls[0] as any[])[0]
    expect(callArg.items[0]).toEqual({ listing_id: 'PD-ABC12', quantity: 1 })
    expect(callArg.items[0]).not.toHaveProperty('unit_price_kes')
    expect(callArg.items[0]).not.toHaveProperty('deposit_kes')
    expect(callArg.items[0]).not.toHaveProperty('product_name')
  })

  test('does not pass client-supplied pricing to createOrder', async () => {
    mockGetUser.mockResolvedValue(authedUser)

    const bodyWithPricing = {
      ...validBody,
      subtotal: 999999,
      depositTotal: 999,
      shippingFee: 500,
    }

    const res = await POST(makeRequest(bodyWithPricing))
    expect(res.status).toBe(201)

    const callArg = (mockCreateOrder.mock.calls[0] as any[])[0]
    expect(callArg).not.toHaveProperty('subtotal')
    expect(callArg).not.toHaveProperty('depositTotal')
    expect(callArg).not.toHaveProperty('shippingFee')
  })

  test('rejects items without listing_id', async () => {
    mockGetUser.mockResolvedValue(authedUser)

    const body = { ...validBody, items: [{ quantity: 1 }] }
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
  })

  test('rejects items with non-positive quantity', async () => {
    mockGetUser.mockResolvedValue(authedUser)

    const body = { ...validBody, items: [{ listing_id: 'PD-X', quantity: 0 }] }
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
  })

  test('rejects empty items array', async () => {
    mockGetUser.mockResolvedValue(authedUser)

    const body = { ...validBody, items: [] }
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
  })

  test('rejects missing shippingAddress', async () => {
    mockGetUser.mockResolvedValue(authedUser)

    const body = {
      items: validBody.items,
      paymentMethod: validBody.paymentMethod,
    }
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
  })

  test('rejects missing paymentMethod', async () => {
    mockGetUser.mockResolvedValue(authedUser)

    const body = {
      items: validBody.items,
      shippingAddress: validBody.shippingAddress,
    }
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
  })
})

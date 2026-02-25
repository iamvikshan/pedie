import { describe, test, expect, mock, beforeEach } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

// Mock auth helpers
const mockGetUser = mock(() => Promise.resolve(null as any))

mock.module('@lib/auth/helpers', () => ({
  getUser: mockGetUser,
}))

// Mock orders data
const mockCreateOrder = mock(() =>
  Promise.resolve({ id: 'order-new-123', status: 'pending' })
)

mock.module('@lib/data/orders', () => ({
  createOrder: mockCreateOrder,
  getOrderById: mock(() => Promise.resolve(null)),
  getOrdersByUser: mock(() => Promise.resolve([])),
}))

// Import AFTER mocking
const { POST } = await import('@/app/api/orders/route')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('POST /api/orders (auth)', () => {
  const validBody = {
    items: [
      { listing_id: 'PD-ABC12', unit_price_kes: 50000, deposit_kes: 2500 },
    ],
    subtotal: 50000,
    depositTotal: 2500,
    shippingFee: 0,
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

  beforeEach(() => {
    mockGetUser.mockReset()
    mockCreateOrder.mockReset()
    mockCreateOrder.mockResolvedValue({ id: 'order-new-123', status: 'pending' })
  })

  test('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.error).toContain('Unauthorized')
  })

  test('creates order with authenticated user ID', async () => {
    const mockUser = { id: 'user-auth-123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue(mockUser)

    const request = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    // Verify createOrder was called with the authenticated user's ID
    expect(mockCreateOrder).toHaveBeenCalledTimes(1)
    const callArg = (mockCreateOrder.mock.calls[0] as any[])[0] as any
    expect(callArg.userId).toBe('user-auth-123')
  })

  test('ignores userId from request body', async () => {
    const mockUser = { id: 'user-auth-123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue(mockUser)

    const bodyWithUserId = { ...validBody, userId: 'hacker-user-id' }

    const request = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyWithUserId),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    const callArg2 = (mockCreateOrder.mock.calls[0] as any[])[0] as any
    expect(callArg2.userId).toBe('user-auth-123')
    expect(callArg2.userId).not.toBe('hacker-user-id')
  })

  test('returns 400 for missing required fields', async () => {
    const mockUser = { id: 'user-auth-123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue(mockUser)

    const request = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})

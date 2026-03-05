import { beforeEach, describe, expect, mock, test } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockGetUser = mock(() => Promise.resolve(null as any))

mock.module('@helpers/auth', () => ({
  getUser: () => mockGetUser(),
}))

const mockGetOrderById = mock(() => Promise.resolve(null as any))

mock.module('@data/orders', () => ({
  getOrderById: () => mockGetOrderById(),
  getOrdersByUser: mock(() => Promise.resolve([])),
  createOrder: mock(() =>
    Promise.resolve({ id: 'order-new-123', status: 'pending' })
  ),
}))

const mockIsUserAdmin = mock(() => Promise.resolve(false))

mock.module('@lib/auth/admin', () => ({
  isUserAdmin: () => mockIsUserAdmin(),
}))

// Import AFTER mocking
const { GET } = await import('@/app/api/orders/[id]/route')

// ── Helpers ────────────────────────────────────────────────────────────────

function makeGetRequest(id: string) {
  return new Request(`http://localhost:3000/api/orders/${id}`, {
    method: 'GET',
  })
}

const mockParams = (id: string) => Promise.resolve({ id })

const sampleOrder = {
  id: 'order-abc-123',
  user_id: 'user-owner-1',
  status: 'pending',
  total_kes: 50000,
  subtotal_kes: 50000,
  deposit_amount_kes: 2500,
  balance_due_kes: 47500,
  shipping_fee_kes: 0,
  items: [],
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/orders/[id] (auth)', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockGetOrderById.mockReset()
    mockIsUserAdmin.mockReset()
    mockIsUserAdmin.mockResolvedValue(false)
  })

  test('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue(null)

    const response = await GET(makeGetRequest('order-abc-123'), {
      params: mockParams('order-abc-123'),
    })
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.error).toContain('Unauthorized')
  })

  test('returns 200 when owner requests their order', async () => {
    const owner = { id: 'user-owner-1', email: 'owner@example.com' }
    mockGetUser.mockResolvedValue(owner)
    mockGetOrderById.mockResolvedValue(sampleOrder)

    const response = await GET(makeGetRequest('order-abc-123'), {
      params: mockParams('order-abc-123'),
    })
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.id).toBe('order-abc-123')
  })

  test('returns 403 when non-owner requests another user order', async () => {
    const nonOwner = { id: 'user-other-99', email: 'other@example.com' }
    mockGetUser.mockResolvedValue(nonOwner)
    mockGetOrderById.mockResolvedValue(sampleOrder)
    mockIsUserAdmin.mockResolvedValue(false)

    const response = await GET(makeGetRequest('order-abc-123'), {
      params: mockParams('order-abc-123'),
    })
    expect(response.status).toBe(403)

    const data = await response.json()
    expect(data.error).toContain('Forbidden')
  })

  test('returns 200 when admin requests any order', async () => {
    const admin = { id: 'user-admin-1', email: 'admin@example.com' }
    mockGetUser.mockResolvedValue(admin)
    mockGetOrderById.mockResolvedValue(sampleOrder)
    mockIsUserAdmin.mockResolvedValue(true)

    const response = await GET(makeGetRequest('order-abc-123'), {
      params: mockParams('order-abc-123'),
    })
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.id).toBe('order-abc-123')
  })
})

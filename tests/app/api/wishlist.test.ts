import { describe, test, expect, mock, beforeEach } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockGetUser = mock(() => Promise.resolve(null as any))

mock.module('@helpers/auth', () => ({
  getUser: mockGetUser,
}))

const mockGetWishlistByUser = mock(() => Promise.resolve([] as any[]))
const mockAddToWishlist = mock(() => Promise.resolve({ id: 'w1' } as any))
const mockRemoveFromWishlist = mock(() => Promise.resolve(true))

mock.module('@lib/data/wishlist', () => ({
  getWishlistByUser: mockGetWishlistByUser,
  addToWishlist: mockAddToWishlist,
  removeFromWishlist: mockRemoveFromWishlist,
  isInWishlist: mock(() => Promise.resolve(false)),
  getWishlistProductIds: mock(() => Promise.resolve([])),
}))

// Import AFTER mocking
const { GET, POST, DELETE } = await import('@/app/api/wishlist/route')

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(method: string, body?: any) {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) options.body = JSON.stringify(body)
  return new Request('http://localhost:3000/api/wishlist', options)
}

// Type-safe wrapper for GET (takes no args)
const callGET = () => GET()

// ── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/wishlist', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockGetWishlistByUser.mockReset()
    mockGetWishlistByUser.mockResolvedValue([])
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await callGET()
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Unauthorized')
  })

  test('returns wishlist items for authenticated user', async () => {
    const mockUser = { id: 'user-1', email: 'test@test.com' }
    mockGetUser.mockResolvedValue(mockUser)

    const items = [
      {
        id: 'w1',
        product_id: 'prod-1',
        product: { brand: 'Apple', model: 'iPhone 15' },
      },
    ]
    mockGetWishlistByUser.mockResolvedValue(items)

    const res = await callGET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.items).toEqual(items)
    expect(mockGetWishlistByUser).toHaveBeenCalledWith('user-1')
  })
})

describe('POST /api/wishlist', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockAddToWishlist.mockReset()
    mockAddToWishlist.mockResolvedValue({ id: 'w1', product_id: 'prod-1' })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await POST(makeRequest('POST', { productId: 'prod-1' }))
    expect(res.status).toBe(401)
  })

  test('returns 400 when productId is missing', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })
    const res = await POST(makeRequest('POST', {}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('productId')
  })

  test('adds product to wishlist for authenticated user', async () => {
    const mockUser = { id: 'user-1' }
    mockGetUser.mockResolvedValue(mockUser)

    const res = await POST(makeRequest('POST', { productId: 'prod-1' }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.item).toBeDefined()
    expect(mockAddToWishlist).toHaveBeenCalledWith('user-1', 'prod-1')
  })

  test('returns 500 when add fails', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })
    mockAddToWishlist.mockResolvedValue(null)

    const res = await POST(makeRequest('POST', { productId: 'prod-1' }))
    expect(res.status).toBe(500)
  })

  test('returns 400 for malformed JSON body', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })

    const req = new Request('http://localhost:3000/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Invalid JSON')
  })
})

describe('DELETE /api/wishlist', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockRemoveFromWishlist.mockReset()
    mockRemoveFromWishlist.mockResolvedValue(true)
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await DELETE(makeRequest('DELETE', { productId: 'prod-1' }))
    expect(res.status).toBe(401)
  })

  test('returns 400 when productId is missing', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })
    const res = await DELETE(makeRequest('DELETE', {}))
    expect(res.status).toBe(400)
  })

  test('removes product from wishlist', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })

    const res = await DELETE(makeRequest('DELETE', { productId: 'prod-1' }))
    expect(res.status).toBe(200)
    expect(mockRemoveFromWishlist).toHaveBeenCalledWith('user-1', 'prod-1')
  })

  test('returns 404 when removal fails', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })
    mockRemoveFromWishlist.mockResolvedValue(false)

    const res = await DELETE(makeRequest('DELETE', { productId: 'prod-1' }))
    expect(res.status).toBe(404)
  })

  test('returns 400 for malformed JSON body', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })

    const req = new Request('http://localhost:3000/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    })
    const res = await DELETE(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Invalid JSON')
  })
})

import { describe, test, expect, mock, beforeEach } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockGetUser = mock(() => Promise.resolve(null as any))
const mockIsUserAdmin = mock(() => Promise.resolve(false))

mock.module('@lib/auth/helpers', () => ({
  getUser: mockGetUser,
}))

mock.module('@lib/auth/admin', () => ({
  isUserAdmin: mockIsUserAdmin,
}))

const mockGetAdminListings = mock<any>(() =>
  Promise.resolve({
    data: [],
    total: 0,
    page: 1,
    totalPages: 0,
  })
)
const mockCreateListing = mock<any>(() =>
  Promise.resolve({ id: 'listing-1', listing_id: 'PD-ABC12' })
)
const mockUpdateListing = mock<any>(() =>
  Promise.resolve({ id: 'listing-1', listing_id: 'PD-ABC12' })
)
const mockDeleteListing = mock<any>(() => Promise.resolve(true))

mock.module('@lib/data/admin', () => ({
  getAdminListings: mockGetAdminListings,
  createListing: mockCreateListing,
  updateListing: mockUpdateListing,
  deleteListing: mockDeleteListing,
  getAdminProducts: mock(() => Promise.resolve({ data: [], total: 0, page: 1, totalPages: 0 })),
  createProduct: mock(),
  updateProduct: mock(),
  deleteProduct: mock(),
  getAdminCategories: mock(() => Promise.resolve([])),
  createCategory: mock(),
  updateCategory: mock(),
  deleteCategory: mock(),
}))

// Import AFTER mocking
const { GET, POST } = await import('@/app/api/admin/listings/route')
const { PUT, DELETE } = await import('@/app/api/admin/listings/[id]/route')

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(
  method: string,
  body?: Record<string, unknown>,
  url = 'http://localhost:3000/api/admin/listings'
) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

const adminUser = { id: 'admin-user-1', email: 'admin@test.com' }
const normalUser = { id: 'normal-user-1', email: 'user@test.com' }

// ── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/admin/listings', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockGetAdminListings.mockReset()
    mockGetAdminListings.mockResolvedValue({
      data: [{ id: 'l1', listing_id: 'PD-TEST1' }],
      total: 1,
      page: 1,
      totalPages: 1,
    })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await GET(makeRequest('GET'))
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue(normalUser)
    mockIsUserAdmin.mockResolvedValue(false)
    const res = await GET(makeRequest('GET'))
    expect(res.status).toBe(403)
  })

  test('returns paginated listings for admin', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await GET(
      makeRequest(
        'GET',
        undefined,
        'http://localhost:3000/api/admin/listings?page=1&limit=10'
      )
    )
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.data).toHaveLength(1)
    expect(data.total).toBe(1)
  })
})

describe('POST /api/admin/listings', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockCreateListing.mockReset()
    mockCreateListing.mockResolvedValue({
      id: 'listing-1',
      listing_id: 'PD-ABC12',
    })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await POST(
      makeRequest('POST', {
        product_id: 'prod-1',
        price_kes: 50000,
        condition: 'good',
      })
    )
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue(normalUser)
    mockIsUserAdmin.mockResolvedValue(false)
    const res = await POST(
      makeRequest('POST', {
        product_id: 'prod-1',
        price_kes: 50000,
        condition: 'good',
      })
    )
    expect(res.status).toBe(403)
  })

  test('returns 400 when required fields missing', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    const res = await POST(makeRequest('POST', { product_id: 'prod-1' }))
    expect(res.status).toBe(400)
  })

  test('creates listing with admin auth', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await POST(
      makeRequest('POST', {
        product_id: 'prod-1',
        price_kes: 50000,
        condition: 'good',
        listing_id: 'PD-CUSTOM',
      })
    )
    expect(res.status).toBe(201)

    const data = await res.json()
    expect(data.listing_id).toBe('PD-ABC12')
    expect(mockCreateListing).toHaveBeenCalledTimes(1)
  })

  test('auto-generates listing_id if not provided', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await POST(
      makeRequest('POST', {
        product_id: 'prod-1',
        price_kes: 50000,
        condition: 'good',
      })
    )
    expect(res.status).toBe(201)

    const callArg = (mockCreateListing.mock.calls[0] as any[])[0] as any
    expect(callArg.listing_id).toMatch(/^PD-[A-Z0-9]{5}$/)
  })
})

describe('PUT /api/admin/listings/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockUpdateListing.mockReset()
    mockUpdateListing.mockResolvedValue({
      id: 'listing-1',
      listing_id: 'PD-ABC12',
      price_kes: 60000,
    })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const req = makeRequest('PUT', { price_kes: 60000 })
    const res = await PUT(req, { params: Promise.resolve({ id: 'listing-1' }) })
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue(normalUser)
    mockIsUserAdmin.mockResolvedValue(false)
    const req = makeRequest('PUT', { price_kes: 60000 })
    const res = await PUT(req, { params: Promise.resolve({ id: 'listing-1' }) })
    expect(res.status).toBe(403)
  })

  test('updates listing', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('PUT', { price_kes: 60000 })
    const res = await PUT(req, { params: Promise.resolve({ id: 'listing-1' }) })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.price_kes).toBe(60000)
    expect(mockUpdateListing).toHaveBeenCalledWith('listing-1', {
      price_kes: 60000,
    })
  })
})

describe('DELETE /api/admin/listings/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockDeleteListing.mockReset()
    mockDeleteListing.mockResolvedValue(true)
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const req = makeRequest('DELETE')
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'listing-1' }),
    })
    expect(res.status).toBe(401)
  })

  test('deletes listing', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('DELETE')
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'listing-1' }),
    })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.success).toBe(true)
    expect(mockDeleteListing).toHaveBeenCalledWith('listing-1')
  })
})

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

const mockGetAdminCustomers = mock<any>(() =>
  Promise.resolve({
    data: [],
    total: 0,
    page: 1,
    totalPages: 0,
  })
)
const mockGetAdminCustomerDetail = mock<any>(() =>
  Promise.resolve({
    profile: null,
    orders: [],
    wishlist: [],
  })
)
const mockUpdateUserRole = mock<any>(() =>
  Promise.resolve({ id: 'user-1', role: 'admin' })
)

mock.module('@lib/data/admin', () => ({
  getAdminCustomers: mockGetAdminCustomers,
  getAdminCustomerDetail: mockGetAdminCustomerDetail,
  updateUserRole: mockUpdateUserRole,
  getAdminOrders: mock(),
  getAdminOrderDetail: mock(),
  updateOrder: mock(),
  getAdminListings: mock(),
  createListing: mock(),
  updateListing: mock(),
  deleteListing: mock(),
  getAdminProducts: mock(),
  createProduct: mock(),
  updateProduct: mock(),
  deleteProduct: mock(),
  getAdminCategories: mock(),
  createCategory: mock(),
  updateCategory: mock(),
  deleteCategory: mock(),
  getAdminReviews: mock(),
  deleteReview: mock(),
  getNewsletterSubscribers: mock(),
  exportNewsletterCSV: mock(),
  getSyncHistory: mock(),
  logSyncResult: mock(),
  getAdminDashboardStats: mock(),
  getRevenueData: mock(),
  getPriceComparisons: mock(),
  getLatestCrawlDate: mock(),
}))

// Import AFTER mocking
const { GET } = await import('@/app/api/admin/customers/route')
const { GET: GET_DETAIL, PUT } = await import(
  '@/app/api/admin/customers/[id]/route'
)

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(
  method: string,
  body?: Record<string, unknown>,
  url = 'http://localhost:3000/api/admin/customers'
) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

const adminUser = { id: 'admin-user-1', email: 'admin@test.com' }

// ── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/admin/customers', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockGetAdminCustomers.mockReset()
    mockGetAdminCustomers.mockResolvedValue({
      data: [{ id: 'u1', full_name: 'Alice', role: 'customer' }],
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
    mockGetUser.mockResolvedValue({ id: 'user-1' })
    mockIsUserAdmin.mockResolvedValue(false)
    const res = await GET(makeRequest('GET'))
    expect(res.status).toBe(403)
  })

  test('returns customers for admin', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await GET(makeRequest('GET'))
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.data).toHaveLength(1)
    expect(data.data[0].full_name).toBe('Alice')
  })

  test('passes search and role filters', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    await GET(
      makeRequest(
        'GET',
        undefined,
        'http://localhost:3000/api/admin/customers?search=alice&role=admin'
      )
    )

    expect(mockGetAdminCustomers).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'alice',
        role: 'admin',
      })
    )
  })
})

describe('GET /api/admin/customers/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockGetAdminCustomerDetail.mockReset()
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await GET_DETAIL(makeRequest('GET'), {
      params: Promise.resolve({ id: 'user-1' }),
    })
    expect(res.status).toBe(401)
  })

  test('returns 404 when customer not found', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    mockGetAdminCustomerDetail.mockResolvedValue({
      profile: null,
      orders: [],
      wishlist: [],
    })

    const res = await GET_DETAIL(makeRequest('GET'), {
      params: Promise.resolve({ id: 'nonexistent' }),
    })
    expect(res.status).toBe(404)
  })

  test('returns customer detail for admin', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    mockGetAdminCustomerDetail.mockResolvedValue({
      profile: { id: 'user-1', full_name: 'Alice', role: 'customer' },
      orders: [{ id: 'o1', total_kes: 10000 }],
      wishlist: [],
    })

    const res = await GET_DETAIL(makeRequest('GET'), {
      params: Promise.resolve({ id: 'user-1' }),
    })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.profile.full_name).toBe('Alice')
    expect(data.orders).toHaveLength(1)
  })
})

describe('PUT /api/admin/customers/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockUpdateUserRole.mockReset()
    mockUpdateUserRole.mockResolvedValue({ id: 'user-1', role: 'admin' })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const req = makeRequest('PUT', { role: 'admin' })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'user-1' }),
    })
    expect(res.status).toBe(401)
  })

  test('returns 400 with invalid role', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('PUT', { role: 'superadmin' })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'user-1' }),
    })
    expect(res.status).toBe(400)
  })

  test('updates user role', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('PUT', { role: 'admin' })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'user-1' }),
    })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.role).toBe('admin')
    expect(mockUpdateUserRole).toHaveBeenCalledWith('user-1', 'admin')
  })
})

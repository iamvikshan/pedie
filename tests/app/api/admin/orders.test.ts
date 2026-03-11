import { beforeEach, describe, expect, mock, test } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockGetUser = mock(() => Promise.resolve(null as any))
const mockIsUserAdmin = mock(() => Promise.resolve(false))

mock.module('@helpers/auth', () => ({
  getUser: mockGetUser,
}))

mock.module('@lib/auth/admin', () => ({
  isUserAdmin: mockIsUserAdmin,
}))

const mockGetAdminOrders = mock<any>(() =>
  Promise.resolve({
    data: [],
    total: 0,
    page: 1,
    totalPages: 0,
  })
)

const mockGetAdminOrderDetail = mock<any>(() =>
  Promise.resolve({
    order: null,
    items: [],
    customer: null,
  })
)

const mockUpdateOrder = mock<any>(() =>
  Promise.resolve({ id: 'order-1', status: 'shipped', user_id: 'user-1' })
)

const {
  productCreateSchema, productUpdateSchema,
  listingCreateSchema, listingUpdateSchema,
  categoryCreateSchema, categoryUpdateSchema,
} = await import('@data/admin')

mock.module('@data/admin', () => ({
  productCreateSchema, productUpdateSchema,
  listingCreateSchema, listingUpdateSchema,
  categoryCreateSchema, categoryUpdateSchema,
  getAdminOrders: mockGetAdminOrders,
  getAdminOrderDetail: mockGetAdminOrderDetail,
  updateOrder: mockUpdateOrder,
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
  getAdminCustomers: mock(),
  getAdminCustomerDetail: mock(),
  updateUserRole: mock(),
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

const mockSendShippingUpdate = mock(() => Promise.resolve())
const mockSendDeliveryConfirmation = mock(() => Promise.resolve())
const mockSendOrderCancelled = mock(() => Promise.resolve())

mock.module('@lib/email/send', () => ({
  sendShippingUpdate: mockSendShippingUpdate,
  sendDeliveryConfirmation: mockSendDeliveryConfirmation,
  sendOrderCancelled: mockSendOrderCancelled,
}))

const mockSupabaseFrom = mock<any>()
const mockSupabaseAuth = {
  admin: {
    getUserById: mock<any>(() =>
      Promise.resolve({
        data: { user: { email: 'customer@test.com' } },
      })
    ),
  },
}

mock.module('@lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockSupabaseFrom,
    auth: mockSupabaseAuth,
  }),
}))

// Import AFTER mocking
const { GET } = await import('@/app/api/admin/orders/route')
const { GET: GET_DETAIL, PUT } =
  await import('@/app/api/admin/orders/[id]/route')

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(
  method: string,
  body?: Record<string, unknown>,
  url = 'http://localhost:3000/api/admin/orders'
) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

const adminUser = { id: 'admin-user-1', email: 'admin@test.com' }

// ── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/admin/orders', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockGetAdminOrders.mockReset()
    mockGetAdminOrders.mockResolvedValue({
      data: [{ id: 'o1', status: 'pending', total_kes: 50000 }],
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

  test('returns paginated orders for admin', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await GET(
      makeRequest(
        'GET',
        undefined,
        'http://localhost:3000/api/admin/orders?page=1&limit=10'
      )
    )
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.data).toHaveLength(1)
    expect(data.total).toBe(1)
  })

  test('passes filters to getAdminOrders', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    await GET(
      makeRequest(
        'GET',
        undefined,
        'http://localhost:3000/api/admin/orders?status=shipped&search=abc'
      )
    )

    expect(mockGetAdminOrders).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'shipped',
        search: 'abc',
      })
    )
  })
})

describe('GET /api/admin/orders/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockGetAdminOrderDetail.mockReset()
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await GET_DETAIL(makeRequest('GET'), {
      params: Promise.resolve({ id: 'order-1' }),
    })
    expect(res.status).toBe(401)
  })

  test('returns 404 when order not found', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    mockGetAdminOrderDetail.mockResolvedValue({
      order: null,
      items: [],
      customer: null,
    })

    const res = await GET_DETAIL(makeRequest('GET'), {
      params: Promise.resolve({ id: 'nonexistent' }),
    })
    expect(res.status).toBe(404)
  })

  test('returns order detail for admin', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    mockGetAdminOrderDetail.mockResolvedValue({
      order: { id: 'order-1', status: 'pending', total_kes: 50000 },
      items: [{ id: 'item-1', unit_price_kes: 50000 }],
      customer: { id: 'user-1', full_name: 'Test User' },
    })

    const res = await GET_DETAIL(makeRequest('GET'), {
      params: Promise.resolve({ id: 'order-1' }),
    })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.order.id).toBe('order-1')
    expect(data.items).toHaveLength(1)
    expect(data.customer.full_name).toBe('Test User')
  })
})

describe('PUT /api/admin/orders/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockUpdateOrder.mockReset()
    mockUpdateOrder.mockResolvedValue({
      id: 'order-1',
      status: 'shipped',
      user_id: 'user-1',
    })
    mockSupabaseFrom.mockReset()
    mockSupabaseFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { full_name: 'Test User' },
            }),
        }),
      }),
    })
    mockSupabaseAuth.admin.getUserById.mockReset()
    mockSupabaseAuth.admin.getUserById.mockResolvedValue({
      data: { user: { email: 'customer@test.com' } },
    })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const req = makeRequest('PUT', { status: 'shipped' })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })
    mockIsUserAdmin.mockResolvedValue(false)
    const req = makeRequest('PUT', { status: 'shipped' })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })
    expect(res.status).toBe(403)
  })

  test('updates order status', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('PUT', { status: 'shipped' })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.status).toBe('shipped')
    expect(mockUpdateOrder).toHaveBeenCalledWith('order-1', {
      status: 'shipped',
    })
  })

  test('updates tracking info and notes', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const tracking = { carrier: 'DHL', tracking_number: '123456' }
    const req = makeRequest('PUT', {
      tracking_info: tracking,
      notes: 'Test note',
    })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })
    expect(res.status).toBe(200)
    expect(mockUpdateOrder).toHaveBeenCalledWith('order-1', {
      tracking_info: tracking,
      notes: 'Test note',
    })
  })

  test('returns 400 for invalid status', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('PUT', { status: 'invalid_status' })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Invalid status')
  })

  test('returns 400 when tracking_info is an array', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('PUT', { tracking_info: ['invalid'] })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('tracking_info must be a plain object')
  })

  test('calls sendShippingUpdate when status changes to shipped', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    mockSendShippingUpdate.mockReset()

    const req = makeRequest('PUT', { status: 'shipped' })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })
    expect(res.status).toBe(200)

    // Allow fire-and-forget promise to resolve
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockSendShippingUpdate).toHaveBeenCalledTimes(1)
  })

  test('calls sendDeliveryConfirmation when status changes to delivered', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    mockUpdateOrder.mockResolvedValue({
      id: 'order-1',
      status: 'delivered',
      user_id: 'user-1',
    })
    mockSendDeliveryConfirmation.mockReset()

    const req = makeRequest('PUT', { status: 'delivered' })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })
    expect(res.status).toBe(200)

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockSendDeliveryConfirmation).toHaveBeenCalledTimes(1)
  })

  test('calls sendOrderCancelled when status changes to cancelled', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    mockUpdateOrder.mockResolvedValue({
      id: 'order-1',
      status: 'cancelled',
      user_id: 'user-1',
    })
    mockSendOrderCancelled.mockReset()

    const req = makeRequest('PUT', { status: 'cancelled' })
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })
    expect(res.status).toBe(200)

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockSendOrderCancelled).toHaveBeenCalledTimes(1)
  })
})

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

const mockGetSyncHistory = mock<any>(() => Promise.resolve([]))
const mockLogSyncResult = mock<any>(() =>
  Promise.resolve({ id: 'log-1', status: 'success' })
)

const {
  productCreateSchema,
  productUpdateSchema,
  listingCreateSchema,
  listingUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
} = await import('@data/admin')

mock.module('@data/admin', () => ({
  productCreateSchema,
  productUpdateSchema,
  listingCreateSchema,
  listingUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  getSyncHistory: mockGetSyncHistory,
  logSyncResult: mockLogSyncResult,
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
  getAdminCustomers: mock(),
  getAdminCustomerDetail: mock(),
  updateUserRole: mock(),
  getAdminReviews: mock(),
  deleteReview: mock(),
  getNewsletterSubscribers: mock(),
  exportNewsletterCSV: mock(),
  getAdminDashboardStats: mock(),
  getRevenueData: mock(),
  getPriceComparisons: mock(),
  getLatestCrawlDate: mock(),
}))

const mockSyncFromSheets = mock<any>(() =>
  Promise.resolve({ created: 5, updated: 2, errors: 0, details: [] })
)
const mockSyncToSheets = mock<any>(() =>
  Promise.resolve({ rows: 3, skipped: 0, errors: 0, details: [], tabs: {} })
)

mock.module('@lib/sheets/sync', () => ({
  syncFromSheets: mockSyncFromSheets,
  syncToSheets: mockSyncToSheets,
}))

// Import AFTER mocking
const { GET, POST } = await import('@/app/api/admin/sync/route')

// ── Helpers ────────────────────────────────────────────────────────────────

const adminUser = { id: 'admin-user-1', email: 'admin@test.com' }

// ── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/admin/sync', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockGetSyncHistory.mockReset()
    mockGetSyncHistory.mockResolvedValue([
      {
        id: 'log-1',
        triggered_by: 'admin-user-1',
        status: 'success',
        rows_synced: 10,
        started_at: '2025-01-01T00:00:00Z',
        completed_at: '2025-01-01T00:00:30Z',
      },
    ])
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })
    mockIsUserAdmin.mockResolvedValue(false)
    const res = await GET()
    expect(res.status).toBe(403)
  })

  test('returns sync history for admin', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await GET()
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toHaveLength(1)
    expect(data[0].status).toBe('success')
    expect(data[0].rows_synced).toBe(10)
  })
})

describe('POST /api/admin/sync', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockSyncFromSheets.mockReset()
    mockSyncToSheets.mockReset()
    mockLogSyncResult.mockReset()
    mockSyncFromSheets.mockResolvedValue({
      created: 5,
      updated: 2,
      errors: 0,
      details: [],
    })
    mockSyncToSheets.mockResolvedValue({
      rows: 3,
      skipped: 0,
      errors: 0,
      details: [],
      tabs: {},
    })
    mockLogSyncResult.mockResolvedValue({ id: 'log-1', status: 'success' })
  })

  const makeRequest = (body?: Record<string, unknown>) =>
    new Request('http://localhost/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })
    mockIsUserAdmin.mockResolvedValue(false)
    const res = await POST(makeRequest())
    expect(res.status).toBe(403)
  })

  test('triggers pull sync by default and returns result', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await POST(makeRequest())
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.direction).toBe('pull')
    expect(data.report.created).toBe(5)
    expect(data.report.updated).toBe(2)

    expect(mockSyncFromSheets).toHaveBeenCalledTimes(1)
    expect(mockSyncFromSheets).toHaveBeenCalledWith('admin')
    expect(mockSyncToSheets).not.toHaveBeenCalled()
    expect(mockLogSyncResult).toHaveBeenCalledTimes(1)
  })

  test('triggers push sync when direction=push', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await POST(makeRequest({ direction: 'push' }))
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.direction).toBe('push')
    expect(data.exportReport).toBeDefined()

    expect(mockSyncFromSheets).not.toHaveBeenCalled()
    expect(mockSyncToSheets).toHaveBeenCalledTimes(1)
  })

  test('triggers both when direction=both', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await POST(makeRequest({ direction: 'both' }))
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.direction).toBe('both')

    expect(mockSyncFromSheets).toHaveBeenCalledTimes(1)
    expect(mockSyncToSheets).toHaveBeenCalledTimes(1)
  })

  test('logs error on sync failure', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    mockSyncFromSheets.mockRejectedValue(new Error('Sheets API error'))

    const res = await POST(makeRequest())
    expect(res.status).toBe(500)

    const data = await res.json()
    expect(data.error).toBe('Sync failed')
    expect(mockLogSyncResult).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        rows_synced: 0,
      })
    )
  })
})

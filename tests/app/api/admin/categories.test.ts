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

mock.module('@lib/data/audit', () => ({
  logAdminEvent: mock(),
}))

const mockGetAdminCategories = mock(() =>
  Promise.resolve([{ id: 'cat-1', name: 'Phones', slug: 'phones' }])
)
const mockCreateCategory = mock(() =>
  Promise.resolve({ id: 'cat-1', name: 'Phones', slug: 'phones' })
)
const mockUpdateCategory = mock(() =>
  Promise.resolve({ id: 'cat-1', name: 'Smartphones', slug: 'smartphones' })
)
const mockDeleteCategory = mock(() => Promise.resolve(true))

const {
  categoryCreateSchema,
  categoryUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  listingCreateSchema,
  listingUpdateSchema,
} = await import('@data/admin')

mock.module('@data/admin', () => ({
  categoryCreateSchema,
  categoryUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  listingCreateSchema,
  listingUpdateSchema,
  getAdminCategories: mockGetAdminCategories,
  createCategory: mockCreateCategory,
  updateCategory: mockUpdateCategory,
  deleteCategory: mockDeleteCategory,
  getAdminListings: mock(() =>
    Promise.resolve({ data: [], total: 0, page: 1, totalPages: 0 })
  ),
  createListing: mock(),
  updateListing: mock(),
  deleteListing: mock(),
  getAdminProducts: mock(() =>
    Promise.resolve({ data: [], total: 0, page: 1, totalPages: 0 })
  ),
  createProduct: mock(),
  updateProduct: mock(),
  deleteProduct: mock(),
}))

// Import AFTER mocking
const { GET, POST } = await import('@/app/api/admin/categories/route')
const { PUT, DELETE } = await import('@/app/api/admin/categories/[id]/route')

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(
  method: string,
  body?: Record<string, unknown>,
  url = 'http://localhost:3000/api/admin/categories'
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

describe('GET /api/admin/categories', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockGetAdminCategories.mockReset()
    mockGetAdminCategories.mockResolvedValue([
      { id: 'cat-1', name: 'Phones', slug: 'phones' },
    ])
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue(normalUser)
    mockIsUserAdmin.mockResolvedValue(false)
    const res = await GET()
    expect(res.status).toBe(403)
  })

  test('returns categories for admin', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await GET()
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe('Phones')
  })
})

describe('POST /api/admin/categories', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockCreateCategory.mockReset()
    mockCreateCategory.mockResolvedValue({
      id: 'cat-1',
      name: 'Phones',
      slug: 'phones',
    })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await POST(
      makeRequest('POST', { name: 'Phones', slug: 'phones' })
    )
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue(normalUser)
    mockIsUserAdmin.mockResolvedValue(false)
    const res = await POST(
      makeRequest('POST', { name: 'Phones', slug: 'phones' })
    )
    expect(res.status).toBe(403)
  })

  test('returns 400 when required fields missing', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    const res = await POST(makeRequest('POST', {}))
    expect(res.status).toBe(400)
  })

  test('creates category with admin auth', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await POST(
      makeRequest('POST', { name: 'Phones', slug: 'phones' })
    )
    expect(res.status).toBe(201)

    const data = await res.json()
    expect(data.name).toBe('Phones')
    expect(mockCreateCategory).toHaveBeenCalledTimes(1)
  })

  test('auto-generates slug from name if not provided', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await POST(
      makeRequest('POST', { name: 'Smart Phones & Tablets' })
    )
    expect(res.status).toBe(201)

    const callArg = (mockCreateCategory.mock.calls[0] as any[])[0] as any
    expect(callArg.slug).toBe('smart-phones-tablets')
  })
})

describe('PUT /api/admin/categories/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockUpdateCategory.mockReset()
    mockUpdateCategory.mockResolvedValue({
      id: 'cat-1',
      name: 'Smartphones',
      slug: 'smartphones',
    })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const req = makeRequest('PUT', { name: 'Smartphones' })
    const res = await PUT(req, { params: Promise.resolve({ id: 'cat-1' }) })
    expect(res.status).toBe(401)
  })

  test('updates category', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('PUT', { name: 'Smartphones' })
    const res = await PUT(req, { params: Promise.resolve({ id: 'cat-1' }) })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.name).toBe('Smartphones')
    expect(mockUpdateCategory).toHaveBeenCalledWith('cat-1', {
      name: 'Smartphones',
    })
  })
})

describe('DELETE /api/admin/categories/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockDeleteCategory.mockReset()
    mockDeleteCategory.mockResolvedValue(true)
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const req = makeRequest('DELETE')
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'cat-1' }),
    })
    expect(res.status).toBe(401)
  })

  test('deletes category', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('DELETE')
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'cat-1' }),
    })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.success).toBe(true)
    expect(mockDeleteCategory).toHaveBeenCalledWith('cat-1')
  })
})

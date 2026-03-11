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

const mockGetAdminProducts = mock<any>(() =>
  Promise.resolve({
    data: [],
    total: 0,
    page: 1,
    totalPages: 0,
  })
)
const mockCreateProduct = mock<any>(() =>
  Promise.resolve({ id: 'prod-1', brand_id: 'brand-1', name: 'iPhone 15' })
)
const mockUpdateProduct = mock<any>(() =>
  Promise.resolve({ id: 'prod-1', brand_id: 'brand-1', name: 'iPhone 15 Pro' })
)
const mockDeleteProduct = mock<any>(() => Promise.resolve(true))

const mockAdminSingle = mock(() =>
  Promise.resolve({ data: { name: 'Apple' }, error: null })
)
const mockAdminEq = mock(() => ({ single: mockAdminSingle }))
const mockAdminSelect = mock(() => ({ eq: mockAdminEq }))
const mockProductCategoriesInsert = mock(() => Promise.resolve({ error: null }))
const mockProductCategoriesDeleteEq = mock(() =>
  Promise.resolve({ error: null })
)
const mockProductCategoriesDelete = mock(() => ({
  eq: mockProductCategoriesDeleteEq,
}))
const mockProductCategoriesUpdateEqIsPrimary = mock(() =>
  Promise.resolve({ error: null })
)
const mockProductCategoriesUpdateEqProductId = mock(() => ({
  eq: mockProductCategoriesUpdateEqIsPrimary,
}))
const mockProductCategoriesUpdate = mock(() => ({
  eq: mockProductCategoriesUpdateEqProductId,
}))
const mockProductCategoriesUpsert = mock(() => Promise.resolve({ error: null }))

mock.module('@lib/supabase/admin', () => ({
  createAdminClient: mock(() => ({
    from: mock((table: string) => {
      if (table === 'brands') {
        return { select: mockAdminSelect }
      }
      if (table === 'product_categories') {
        return {
          insert: mockProductCategoriesInsert,
          delete: mockProductCategoriesDelete,
          update: mockProductCategoriesUpdate,
          upsert: mockProductCategoriesUpsert,
        }
      }

      return { select: mockAdminSelect }
    }),
  })),
}))

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
  getAdminListings: mock(() =>
    Promise.resolve({ data: [], total: 0, page: 1, totalPages: 0 })
  ),
  createListing: mock(),
  updateListing: mock(),
  deleteListing: mock(),
  getAdminProducts: mockGetAdminProducts,
  createProduct: mockCreateProduct,
  updateProduct: mockUpdateProduct,
  deleteProduct: mockDeleteProduct,
}))

// Import AFTER mocking
const { GET, POST } = await import('@/app/api/admin/products/route')
const { PUT, DELETE } = await import('@/app/api/admin/products/[id]/route')

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(
  method: string,
  body?: Record<string, unknown>,
  url = 'http://localhost:3000/api/admin/products'
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

describe('GET /api/admin/products', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockGetAdminProducts.mockReset()
    mockGetAdminProducts.mockResolvedValue({
      data: [{ id: 'p1', brand: { name: 'Apple' }, name: 'iPhone 15' }],
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

  test('returns paginated products for admin', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await GET(makeRequest('GET'))
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.data).toHaveLength(1)
  })
})

describe('POST /api/admin/products', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockCreateProduct.mockReset()
    mockCreateProduct.mockResolvedValue({
      id: 'prod-1',
      brand_id: 'brand-1',
      name: 'iPhone 15',
    })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await POST(
      makeRequest('POST', {
        brand_id: 'brand-1',
        name: 'iPhone 15',
        slug: 'apple-iphone-15',
      })
    )
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue(normalUser)
    mockIsUserAdmin.mockResolvedValue(false)
    const res = await POST(
      makeRequest('POST', {
        brand_id: 'brand-1',
        name: 'iPhone 15',
        slug: 'apple-iphone-15',
      })
    )
    expect(res.status).toBe(403)
  })

  test('returns 400 when required fields missing', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    const res = await POST(makeRequest('POST', { brand_id: 'brand-1' }))
    expect(res.status).toBe(400)
  })

  test('creates product with admin auth', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await POST(
      makeRequest('POST', {
        brand_id: 'brand-1',
        name: 'iPhone 15',
        slug: 'apple-iphone-15',
      })
    )
    expect(res.status).toBe(201)

    const data = await res.json()
    expect(data.name).toBe('iPhone 15')
    expect(mockCreateProduct).toHaveBeenCalledTimes(1)
  })

  test('auto-generates slug if not provided', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await POST(
      makeRequest('POST', {
        brand_id: 'brand-1',
        name: 'iPhone 15 Pro',
      })
    )
    expect(res.status).toBe(201)

    const callArg = (mockCreateProduct.mock.calls[0] as any[])[0] as any
    expect(callArg.slug).toBe('apple-iphone-15-pro')
  })
})

describe('PUT /api/admin/products/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockUpdateProduct.mockReset()
    mockProductCategoriesDelete.mockReset()
    mockProductCategoriesDeleteEq.mockReset()
    mockProductCategoriesUpdate.mockReset()
    mockProductCategoriesUpdateEqProductId.mockReset()
    mockProductCategoriesUpdateEqIsPrimary.mockReset()
    mockProductCategoriesUpsert.mockReset()
    mockUpdateProduct.mockResolvedValue({
      id: 'prod-1',
      brand_id: 'brand-1',
      name: 'iPhone 15 Pro',
    })
    mockProductCategoriesDelete.mockReturnValue({
      eq: mockProductCategoriesDeleteEq,
    })
    mockProductCategoriesUpdate.mockReturnValue({
      eq: mockProductCategoriesUpdateEqProductId,
    })
    mockProductCategoriesUpdateEqProductId.mockReturnValue({
      eq: mockProductCategoriesUpdateEqIsPrimary,
    })
    mockProductCategoriesDeleteEq.mockResolvedValue({ error: null })
    mockProductCategoriesUpdateEqIsPrimary.mockResolvedValue({ error: null })
    mockProductCategoriesUpsert.mockResolvedValue({ error: null })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const req = makeRequest('PUT', { name: 'iPhone 15 Pro' })
    const res = await PUT(req, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue(normalUser)
    mockIsUserAdmin.mockResolvedValue(false)
    const req = makeRequest('PUT', { name: 'iPhone 15 Pro' })
    const res = await PUT(req, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(403)
  })

  test('updates product', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('PUT', { name: 'iPhone 15 Pro' })
    const res = await PUT(req, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.name).toBe('iPhone 15 Pro')
    expect(mockUpdateProduct).toHaveBeenCalledWith('prod-1', {
      name: 'iPhone 15 Pro',
    })
  })

  test('updates primary category without deleting secondary memberships', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('PUT', {
      name: 'iPhone 15 Pro',
      category_id: 'cat-2',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'prod-1' }) })

    expect(res.status).toBe(200)
    expect(mockUpdateProduct).toHaveBeenCalledWith('prod-1', {
      name: 'iPhone 15 Pro',
    })
    expect(mockProductCategoriesDelete).not.toHaveBeenCalled()
    expect(mockProductCategoriesUpdate).toHaveBeenCalledWith({
      is_primary: false,
    })
    expect(mockProductCategoriesUpdateEqProductId).toHaveBeenCalledWith(
      'product_id',
      'prod-1'
    )
    expect(mockProductCategoriesUpdateEqIsPrimary).toHaveBeenCalledWith(
      'is_primary',
      true
    )
    expect(mockProductCategoriesUpsert).toHaveBeenCalledWith(
      {
        product_id: 'prod-1',
        category_id: 'cat-2',
        is_primary: true,
      },
      { onConflict: 'product_id,category_id' }
    )
  })
})

describe('DELETE /api/admin/products/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockDeleteProduct.mockReset()
    mockDeleteProduct.mockResolvedValue(true)
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const req = makeRequest('DELETE')
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'prod-1' }),
    })
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue(normalUser)
    mockIsUserAdmin.mockResolvedValue(false)
    const req = makeRequest('DELETE')
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'prod-1' }),
    })
    expect(res.status).toBe(403)
  })

  test('deletes product', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('DELETE')
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'prod-1' }),
    })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.success).toBe(true)
    expect(mockDeleteProduct).toHaveBeenCalledWith('prod-1')
  })
})

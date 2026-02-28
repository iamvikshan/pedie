import { describe, test, expect, mock, beforeEach } from 'bun:test'

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

const mockGetAdminProducts = mock<any>(() =>
  Promise.resolve({
    data: [],
    total: 0,
    page: 1,
    totalPages: 0,
  })
)
const mockCreateProduct = mock<any>(() =>
  Promise.resolve({ id: 'prod-1', brand: 'Apple', model: 'iPhone 15' })
)
const mockUpdateProduct = mock<any>(() =>
  Promise.resolve({ id: 'prod-1', brand: 'Apple', model: 'iPhone 15 Pro' })
)
const mockDeleteProduct = mock<any>(() => Promise.resolve(true))

mock.module('@lib/data/admin', () => ({
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
      data: [{ id: 'p1', brand: 'Apple', model: 'iPhone 15' }],
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
      brand: 'Apple',
      model: 'iPhone 15',
    })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const res = await POST(
      makeRequest('POST', {
        brand: 'Apple',
        model: 'iPhone 15',
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
        brand: 'Apple',
        model: 'iPhone 15',
        slug: 'apple-iphone-15',
      })
    )
    expect(res.status).toBe(403)
  })

  test('returns 400 when required fields missing', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    const res = await POST(makeRequest('POST', { brand: 'Apple' }))
    expect(res.status).toBe(400)
  })

  test('creates product with admin auth', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await POST(
      makeRequest('POST', {
        brand: 'Apple',
        model: 'iPhone 15',
        slug: 'apple-iphone-15',
      })
    )
    expect(res.status).toBe(201)

    const data = await res.json()
    expect(data.brand).toBe('Apple')
    expect(mockCreateProduct).toHaveBeenCalledTimes(1)
  })

  test('auto-generates slug if not provided', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const res = await POST(
      makeRequest('POST', {
        brand: 'Apple',
        model: 'iPhone 15 Pro',
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
    mockUpdateProduct.mockResolvedValue({
      id: 'prod-1',
      brand: 'Apple',
      model: 'iPhone 15 Pro',
    })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const req = makeRequest('PUT', { model: 'iPhone 15 Pro' })
    const res = await PUT(req, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue(normalUser)
    mockIsUserAdmin.mockResolvedValue(false)
    const req = makeRequest('PUT', { model: 'iPhone 15 Pro' })
    const res = await PUT(req, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(403)
  })

  test('updates product', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)

    const req = makeRequest('PUT', { model: 'iPhone 15 Pro' })
    const res = await PUT(req, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.model).toBe('iPhone 15 Pro')
    expect(mockUpdateProduct).toHaveBeenCalledWith('prod-1', {
      model: 'iPhone 15 Pro',
    })
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

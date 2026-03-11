import { describe, expect, mock, test, beforeEach } from 'bun:test'

mock.module('@lib/security/rateLimit', () => ({
  createRateLimiter: () => ({
    limit: async () => ({ success: true, limit: 10, remaining: 9, reset: 0 }),
  }),
}))

mock.module('@helpers/auth', () => ({
  getUser: mock(() => ({ id: 'admin-1', email: 'a@b.com' })),
  isAdmin: mock(() => true),
}))

mock.module('@lib/auth/admin', () => ({
  isUserAdmin: mock(() => true),
}))

const mockCreateProduct = mock()
const { productCreateSchema, listingCreateSchema } = await import('@data/admin')

mock.module('@data/admin', () => ({
  productCreateSchema,
  listingCreateSchema,
  createProduct: mockCreateProduct,
  getAdminProducts: mock(() => ({
    data: [],
    total: 0,
    page: 1,
    totalPages: 0,
  })),
}))

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
const mockFrom = mock((_table: string): any => ({
  select: () => ({
    eq: () => ({ single: () => ({ data: { name: 'Apple' }, error: null }) }),
  }),
}))

mock.module('@lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

mock.module('@utils/slug', () => ({
  productSlug: (_b: string, n: string) => n.toLowerCase().replace(/\s/g, '-'),
  slugify: (s: string) => s.toLowerCase().replace(/\s/g, '-'),
}))

const { POST: productsPost } = await import('@/app/api/admin/products/route')

function jsonReq(url: string, body: Record<string, unknown>): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('Admin Validation', () => {
  beforeEach(() => {
    mockCreateProduct.mockReset()
  })

  test('rejects missing required fields', async () => {
    const res = await productsPost(
      jsonReq('http://localhost/api/admin/products', { name: 'Phone' })
    )
    expect(res.status).toBe(400)
  })

  test('rejects non-numeric price in listing schema', async () => {
    const { listingCreateSchema } = await import('@data/admin')
    const result = listingCreateSchema.safeParse({
      product_id: 'p-1',
      price_kes: 'not-a-number',
      condition: 'new',
    })
    expect(result.success).toBe(false)
  })

  test('accepts valid product data', async () => {
    mockCreateProduct.mockResolvedValueOnce({ id: 'prod-1', name: 'iPhone 15' })

    const res = await productsPost(
      jsonReq('http://localhost/api/admin/products', {
        brand_id: 'brand-1',
        name: 'iPhone 15',
        description: 'Great phone',
      })
    )
    expect(res.status).toBe(201)
  })
})

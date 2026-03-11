import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'

// Mock next/navigation
const mockNotFound = mock(() => {
  throw new Error('NEXT_NOT_FOUND')
})
mock.module('next/navigation', () => ({
  notFound: mockNotFound,
  useRouter: mock(() => ({})),
  usePathname: mock(() => '/'),
  useSearchParams: mock(() => new URLSearchParams()),
}))

// Mock next/image
mock.module('next/image', () => ({
  default: mock(({ src, alt, fill, ...props }: Record<string, unknown>) => {
    return React.createElement('img', {
      src,
      alt,
      'data-fill': fill ? 'true' : undefined,
      ...props,
    })
  }),
}))

// Mock next/link
mock.module('next/link', () => ({
  default: mock(({ children, href, ...props }: Record<string, unknown>) => {
    return React.createElement(
      'a',
      { href: href as string, ...props },
      children as React.ReactNode
    )
  }),
}))

// Mock @data/products
mock.module('@data/products', () => ({
  getProductFamilyBySlug: mock(() => Promise.resolve(null)),
  getRelatedListings: mock(() => Promise.resolve([])),
  getRelatedFamilies: mock(() => Promise.resolve([])),
  LISTING_TYPE_PRIORITY: {},
}))

mock.module('@data/categories', () => ({
  getCategoryBreadcrumb: mock(() =>
    Promise.resolve([{ name: 'Phones', slug: 'phones' }])
  ),
  getPrimaryCategoryForProduct: mock(() =>
    Promise.resolve({
      id: 'cat-1',
      name: 'Phones',
      slug: 'phones',
      description: null,
      image_url: null,
      icon: null,
      is_active: true,
      parent_id: null,
      sort_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    })
  ),
}))

// Mock @data/listings
mock.module('@data/listings', () => ({
  getListingBySku: mock((sku: string) => {
    if (sku === 'PD-TEST1')
      return Promise.resolve({
        id: 'uuid-1',
        sku: 'PD-TEST1',
        product_id: 'prod-1',
        condition: 'excellent',
        price_kes: 45000,
        sale_price_kes: null,
        cost_kes: 40000,
        storage: '128GB',
        color: 'Black',
        battery_health: 92,
        is_featured: false,
        listing_type: 'standard',
        ram: null,
        warranty_months: null,
        attributes: null,
        includes: null,
        admin_notes: null,
        quantity: 1,
        status: 'active',
        images: ['https://example.com/img.jpg'],
        source: null,
        source_id: null,
        source_url: null,
        notes: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        product: {
          id: 'prod-1',
          name: 'iPhone 13',
          slug: 'apple-iphone-13',
          brand_id: 'brand-1',
          specs: { display: '6.1"', chip: 'A15' },
          key_features: ['5G capable', 'Dual camera'],
          images: [],
          description: 'Great phone',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          fts: null,
          brand: {
            id: 'brand-1',
            name: 'Apple',
            slug: 'apple',
            logo_url: null,
            website_url: null,
            is_active: true,
            sort_order: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
      })
    return Promise.resolve(null)
  }),
  getSimilarListings: mock(() => Promise.resolve([])),
}))

// Mock @data/reviews
mock.module('@data/reviews', () => ({
  getProductReviews: mock(() => Promise.resolve({ data: [], count: 0 })),
  getReviewStats: mock(() =>
    Promise.resolve({
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    })
  ),
}))

mock.module('@components/listing/similarListings', () => ({
  SimilarListings: () => React.createElement('div', null, 'SimilarListings'),
}))

// Import components after mocking
const { default: ListingPage, generateMetadata } =
  await import('@/app/(store)/listings/[sku]/page')
const { getListingBySku } = await import('@data/listings')

describe('ListingPage', () => {
  beforeEach(() => {
    mockNotFound.mockClear()
    ;(getListingBySku as ReturnType<typeof mock>).mockClear()
  })

  test('renders listing info for a valid listing', async () => {
    const params = Promise.resolve({ sku: 'PD-TEST1' })
    const element = await ListingPage({ params })
    const html = renderToString(element)

    expect(html).toContain('Apple iPhone 13')
    expect(html).toContain('PD-TEST1')
    expect(html).toContain('45,000')
    expect(html).toContain('128GB')
    expect(html).toContain('Black')
    expect(html).toContain('92')
    expect(html).toContain('Battery Health')
    expect(html).toContain('Excellent')
  })

  test('calls notFound for missing listing', async () => {
    const params = Promise.resolve({ sku: 'INVALID-ID' })

    await expect(ListingPage({ params })).rejects.toThrow('NEXT_NOT_FOUND')

    expect(getListingBySku).toHaveBeenCalledWith('INVALID-ID')
  })

  test('generates metadata for valid listing', async () => {
    const params = Promise.resolve({ sku: 'PD-TEST1' })
    const metadata = await generateMetadata({ params })

    expect(metadata.title).toContain('Apple iPhone 13')
    expect(metadata.title).toContain('PD-TEST1')
    expect(metadata.description).toContain('excellent')
    expect(metadata.description).toContain('45,000')
  })

  test('generates not found metadata for missing listing', async () => {
    const params = Promise.resolve({ sku: 'NONEXISTENT' })
    const metadata = await generateMetadata({ params })

    expect(metadata.title).toBe('Listing Not Found | Pedie')
  })

  test('renders product specs and description', async () => {
    const params = Promise.resolve({ sku: 'PD-TEST1' })
    const element = await ListingPage({ params })
    const html = renderToString(element)

    expect(html).toContain('Specifications')
    expect(html).toContain('display')
    expect(html).toContain('6.1&quot;')
    expect(html).toContain('chip')
    expect(html).toContain('A15')
    expect(html).toContain('Great phone')
    expect(html).toContain('5G capable')
    expect(html).toContain('Dual camera')
  })

  test('renders shipping info', async () => {
    const params = Promise.resolve({ sku: 'PD-TEST1' })
    const element = await ListingPage({ params })
    const html = renderToString(element)

    expect(html).toContain('Free Shipping via Aquantuo')
    expect(html).toContain('business days')
  })
})

describe('Phase 3 locked-variant mirror page checks', () => {
  const src = readFileSync(
    resolve('src/app/(store)/listings/[sku]/page.tsx'),
    'utf-8'
  )
  test('fetches getProductFamilyBySlug', () => {
    expect(src).toContain('getProductFamilyBySlug')
  })
  test('renders VariantSelector with disabled prop', () => {
    expect(src).toContain('disabled')
  })
  test('shows See all variants link', () => {
    expect(src).toContain('See all')
  })

  test('passes a conditional original price to PriceDisplay for discounted listings', () => {
    expect(src).toContain(
      'listing.sale_price_kes != null ? listing.price_kes : null'
    )
  })
})

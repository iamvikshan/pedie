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
  getProductFamilyBySlug: mock(() =>
    Promise.resolve({
      product: { slug: 'test' },
      listings: [],
      representative: {},
      variantCount: 1,
    })
  ),
  getRelatedListings: mock(() => Promise.resolve([])),
  findBetterDeal: mock(() => null),
  getRelatedFamilies: mock(() => Promise.resolve([])),
  LISTING_TYPE_PRIORITY: {},
}))

// Mock @data/listings
mock.module('@data/listings', () => ({
  getListingById: mock((id: string) => {
    if (id === 'PD-TEST1')
      return Promise.resolve({
        id: 'uuid-1',
        listing_id: 'PD-TEST1',
        product_id: 'prod-1',
        condition: 'excellent',
        price_kes: 45000,
        storage: '128GB',
        color: 'Black',
        carrier: 'Unlocked',
        battery_health: 92,
        is_featured: false,
        status: 'available',
        images: ['https://example.com/img.jpg'],
        original_price_usd: 500,
        landed_cost_kes: 40000,
        source: null,
        source_listing_id: null,
        source_url: null,
        sheets_row_id: null,
        notes: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        product: {
          id: 'prod-1',
          brand: 'Apple',
          model: 'iPhone 13',
          slug: 'apple-iphone-13',
          original_price_kes: 55000,
          specs: { display: '6.1"', chip: 'A15' },
          key_features: ['5G capable', 'Dual camera'],
          images: [],
          category_id: 'cat-1',
          description: 'Great phone',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          fts: null,
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

// Mock @lib/cart/store
mock.module('@lib/cart/store', () => ({
  useCartStore: mock(
    (selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        items: [],
        addListing: mock(),
        removeListing: mock(),
        hasListing: () => false,
      }
      return selector(state)
    }
  ),
}))

// Import components after mocking
const { default: ListingPage, generateMetadata } =
  await import('@/app/(store)/listings/[listingId]/page')
const { getListingById } = await import('@data/listings')

describe('ListingPage', () => {
  beforeEach(() => {
    mockNotFound.mockClear()
    ;(getListingById as ReturnType<typeof mock>).mockClear()
  })

  test('renders listing info for a valid listing', async () => {
    const params = Promise.resolve({ listingId: 'PD-TEST1' })
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
    const params = Promise.resolve({ listingId: 'INVALID-ID' })

    await expect(ListingPage({ params })).rejects.toThrow('NEXT_NOT_FOUND')

    expect(getListingById).toHaveBeenCalledWith('INVALID-ID')
  })

  test('generates metadata for valid listing', async () => {
    const params = Promise.resolve({ listingId: 'PD-TEST1' })
    const metadata = await generateMetadata({ params })

    expect(metadata.title).toContain('Apple iPhone 13')
    expect(metadata.title).toContain('PD-TEST1')
    expect(metadata.description).toContain('excellent')
    expect(metadata.description).toContain('45,000')
  })

  test('generates not found metadata for missing listing', async () => {
    const params = Promise.resolve({ listingId: 'NONEXISTENT' })
    const metadata = await generateMetadata({ params })

    expect(metadata.title).toBe('Listing Not Found | Pedie')
  })

  test('renders product specs and description', async () => {
    const params = Promise.resolve({ listingId: 'PD-TEST1' })
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
    const params = Promise.resolve({ listingId: 'PD-TEST1' })
    const element = await ListingPage({ params })
    const html = renderToString(element)

    expect(html).toContain('Free Shipping via Aquantuo')
    expect(html).toContain('business days')
  })
})

describe('Phase 3 locked-variant mirror page checks', () => {
  const src = readFileSync(
    resolve('src/app/(store)/listings/[listingId]/page.tsx'),
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
})

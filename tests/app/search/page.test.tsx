import { describe, test, expect, mock } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

// Mock search data
mock.module('@lib/data/search', () => ({
  searchListings: mock((query: string) => {
    if (query === 'iphone') {
      return Promise.resolve({
        data: [
          {
            id: 'uuid-1',
            listing_id: 'PD-S001',
            product_id: 'prod-1',
            condition: 'excellent',
            price_kes: 45000,
            storage: '128GB',
            color: 'Black',
            battery_health: 92,
            is_preorder: false,
            is_sold: false,
            is_featured: false,
            status: 'available',
            images: [],
            original_price_usd: 400,
            landed_cost_kes: 40000,
            carrier: null,
            source: null,
            source_listing_id: null,
            source_url: null,
            sheets_row_id: null,
            notes: null,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            product: {
              id: 'prod-1',
              brand: 'Apple',
              model: 'iPhone 13',
              slug: 'apple-iphone-13',
              category_id: 'cat-1',
              description: null,
              specs: null,
              key_features: null,
              images: null,
              original_price_kes: 55000,
              created_at: '2024-01-01',
              updated_at: '2024-01-01',
              fts: null,
            },
          },
        ],
        total: 1,
        page: 1,
        perPage: 12,
        totalPages: 1,
      })
    }
    return Promise.resolve({
      data: [],
      total: 0,
      page: 1,
      perPage: 12,
      totalPages: 0,
    })
  }),
}))

// Mock next/link and next/image
mock.module('next/link', () => ({
  default: mock(
    ({
      children,
      href,
      ...props
    }: {
      children: React.ReactNode
      href: string
      [key: string]: unknown
    }) => React.createElement('a', { href, ...props }, children)
  ),
}))
mock.module('next/image', () => ({
  default: mock((props: { src: string; alt: string; [key: string]: unknown }) =>
    React.createElement('img', { src: props.src, alt: props.alt })
  ),
}))

// Mock @lib/cart/store
mock.module('@lib/cart/store', () => ({
  useCartStore: mock((selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      items: [],
      addListing: mock(),
      removeListing: mock(),
      hasListing: () => false,
    }
    return selector(state)
  }),
}))

import SearchPage from '@/app/search/page'

describe('SearchPage', () => {
  test('renders search results for query', async () => {
    const page = await SearchPage({
      searchParams: Promise.resolve({ q: 'iphone' }),
    })
    const html = renderToString(page)

    expect(html).toContain('iphone')
    // React renderToString inserts <!-- --> between JSX expressions
    expect(html).toMatch(/1<!-- --> <!-- -->result<!-- --> found/)
    expect(html).toContain('iPhone 13')
  })

  test('shows empty state for no results', async () => {
    const page = await SearchPage({
      searchParams: Promise.resolve({ q: 'nonexistent' }),
    })
    const html = renderToString(page)

    expect(html).toContain('No results found')
    expect(html).toContain('nonexistent')
    // React renderToString inserts <!-- --> between JSX expressions
    expect(html).toMatch(/0<!-- --> <!-- -->results<!-- --> found/)
  })

  test('shows prompt when no query provided', async () => {
    const page = await SearchPage({
      searchParams: Promise.resolve({}),
    })
    const html = renderToString(page)

    expect(html).toContain('Search for refurbished devices')
  })
})

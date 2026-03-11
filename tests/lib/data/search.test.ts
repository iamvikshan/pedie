import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const searchSource = readFileSync(resolve('src/lib/data/search.ts'), 'utf-8')

const mockListings = [
  {
    id: 'uuid-1',
    sku: 'PD-0001',
    product_id: 'prod-1',
    storage: '128GB',
    color: 'Black',
    condition: 'excellent',
    battery_health: 92,
    price_kes: 45000,
    sale_price_kes: 42000,
    cost_kes: 40000,
    source: 'swappa',
    source_id: null,
    source_url: null,
    images: null,
    is_featured: true,
    listing_type: 'standard',
    ram: null,
    warranty_months: null,
    attributes: null,
    includes: null,
    admin_notes: null,
    quantity: 1,
    status: 'active',
    notes: null,
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
    product: {
      id: 'prod-1',
      name: 'iPhone 13',
      slug: 'apple-iphone-13',
      brand_id: 'brand-1',
      description: null,
      specs: null,
      key_features: null,
      images: null,
      is_active: true,
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z',
      fts: null,
      brand: {
        id: 'brand-1',
        name: 'Apple',
        slug: 'apple',
        logo_url: null,
        website_url: null,
        is_active: true,
        sort_order: 1,
        created_at: '2025-06-01T00:00:00Z',
        updated_at: '2025-06-01T00:00:00Z',
      },
    },
  },
]

function chainable(resolveValue: {
  data: unknown
  error: unknown
  count?: number | null
}) {
  const chain: Record<string, unknown> = {
    select: mock(() => chain),
    eq: mock(() => chain),
    neq: mock(() => chain),
    in: mock(() => chain),
    gte: mock(() => chain),
    lte: mock(() => chain),
    order: mock(() => chain),
    limit: mock(() => chain),
    range: mock(() => chain),
    single: mock(() => Promise.resolve(resolveValue)),
    textSearch: mock(() => chain),
    then: (resolve: (val: unknown) => void) => resolve(resolveValue),
  }
  return chain
}

let fromHandler: (table: string) => unknown

mock.module('@lib/supabase/server', () => ({
  createClient: mock(() =>
    Promise.resolve({
      from: mock((table: string) => fromHandler(table)),
    })
  ),
}))

import { searchListings } from '@data/search'

describe('Search Data Functions', () => {
  describe('searchListings', () => {
    beforeEach(() => {
      fromHandler = (table: string) => {
        if (table === 'products') {
          return chainable({
            data: [{ id: 'prod-1' }],
            error: null,
          })
        }
        // listings table
        return chainable({
          data: mockListings,
          error: null,
          count: 1,
        })
      }
    })

    test('returns paginated search results', async () => {
      const result = await searchListings(
        'iPhone',
        {},
        { page: 1, perPage: 10 }
      )
      expect(result.data).toBeArray()
      expect(result.page).toBe(1)
      expect(result.perPage).toBe(10)
    })

    test('returns empty results when no products match query', async () => {
      fromHandler = (table: string) => {
        if (table === 'products') {
          return chainable({ data: [], error: null })
        }
        return chainable({ data: [], error: null, count: 0 })
      }

      const result = await searchListings(
        'nonexistent',
        {},
        { page: 1, perPage: 10 }
      )
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    test('returns empty results on product search error', async () => {
      fromHandler = (table: string) => {
        if (table === 'products') {
          return chainable({ data: null, error: { message: 'FTS error' } })
        }
        return chainable({ data: [], error: null })
      }

      const result = await searchListings(
        'broken',
        {},
        { page: 1, perPage: 10 }
      )
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    test('applies filters to search results', async () => {
      const result = await searchListings(
        'iPhone',
        {
          condition: ['excellent'],
          priceMin: 30000,
          priceMax: 60000,
        },
        { page: 1, perPage: 10 }
      )
      expect(result.data).toBeArray()
    })

    test('uses default pagination when not provided', async () => {
      const result = await searchListings('iPhone')
      expect(result.page).toBe(1)
      expect(result.perPage).toBe(20)
    })

    test('handles listing query error', async () => {
      fromHandler = (table: string) => {
        if (table === 'products') {
          return chainable({ data: [{ id: 'prod-1' }], error: null })
        }
        return chainable({
          data: null,
          error: { message: 'DB error' },
          count: null,
        })
      }

      const result = await searchListings(
        'iPhone',
        {},
        { page: 1, perPage: 10 }
      )
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  test('exports getSearchSuggestions function', async () => {
    const mod = await import('@data/search')
    expect(mod.getSearchSuggestions).toBeDefined()
    expect(typeof mod.getSearchSuggestions).toBe('function')
  })

  test('exports getAvailableFilters function', async () => {
    const mod = await import('@data/search')
    expect(mod.getAvailableFilters).toBeDefined()
    expect(typeof mod.getAvailableFilters).toBe('function')
  })

  test('exports SearchSuggestion type', () => {
    expect(searchSource).toContain('SearchSuggestion')
    expect(searchSource).toContain('getSearchSuggestions')
    expect(searchSource).toContain('getAvailableFilters')
  })
})

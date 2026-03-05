import { describe, expect, mock, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Mock the server client — must handle both categories and listings query patterns
mock.module('@lib/supabase/server', () => ({
  createClient: mock(() =>
    Promise.resolve({
      from: mock(table => {
        if (table === 'categories') {
          return {
            select: mock(() => ({
              // .eq('slug', ...).single() pattern (getCategoryBySlug, getListingsByCategory)
              eq: mock(() => ({
                single: mock(() =>
                  Promise.resolve({
                    data: { id: 'cat-1' },
                    error: null,
                  })
                ),
              })),
              // .order('sort_order', ...) pattern (getCategories, used by getCategoryAndDescendantIds)
              order: mock(() =>
                Promise.resolve({
                  data: [
                    {
                      id: 'cat-1',
                      name: 'Phones',
                      slug: 'phones',
                      parent_id: null,
                    },
                  ],
                  error: null,
                })
              ),
            })),
          }
        }

        // listings table
        return {
          select: mock(() => {
            const mockData = [
              {
                id: '1',
                listing_id: 'L1',
                price_kes: 50000,
                product: { original_price_kes: 60000 },
              },
              {
                id: '2',
                listing_id: 'L2',
                price_kes: 40000,
                product: { original_price_kes: 80000 },
              }, // 50% discount
            ]

            const terminalMock = {
              order: mock(() => ({
                limit: mock(() =>
                  Promise.resolve({ data: mockData, error: null })
                ),
              })),
              limit: mock(() =>
                Promise.resolve({ data: mockData, error: null })
              ),
              in: mock(function () {
                return terminalMock
              }),
              not: mock(function () {
                return terminalMock
              }),
              neq: mock(function () {
                return terminalMock
              }),
              eq: mock(function () {
                return terminalMock
              }),
            }

            const eqMock = mock(() => {
              return Object.assign(
                Promise.resolve({ data: mockData, error: null }),
                terminalMock
              )
            })

            return {
              eq: eqMock,
              not: mock(() => ({ eq: eqMock, in: eqMock })),
              in: eqMock,
            }
          }),
        }
      }),
    })
  ),
}))

import {
  getDealListings,
  getFeaturedListings,
  getLatestListings,
  getListingsByCategory,
} from '@data/products'

describe('Products Data Functions', () => {
  const SOURCE = readFileSync(resolve('src/lib/data/products.ts'), 'utf-8')

  test('getFeaturedListings returns listings', async () => {
    const listings = await getFeaturedListings()
    expect(Array.isArray(listings)).toBe(true)
    expect(listings.length).toBe(2)
    expect(listings[0].listing_id).toBe('L1')
  })

  test('getLatestListings returns listings', async () => {
    const listings = await getLatestListings()
    expect(Array.isArray(listings)).toBe(true)
    expect(listings.length).toBe(2)
    expect(listings[0].listing_id).toBe('L1')
  })

  test('getListingsByCategory returns listings', async () => {
    const listings = await getListingsByCategory('phones')
    expect(Array.isArray(listings)).toBe(true)
    expect(listings.length).toBe(2)
    expect(listings[0].listing_id).toBe('L1')
  })

  test('getDealListings returns listings sorted by discount', async () => {
    const listings = await getDealListings()
    expect(Array.isArray(listings)).toBe(true)
    expect(listings.length).toBe(2)
    // L2 has 50% discount, L1 has ~16.6% discount, so L2 should be first
    expect(listings[0].listing_id).toBe('L2')
    expect(listings[1].listing_id).toBe('L1')
  })

  test('getRelatedListings uses non-sold/reserved filter', () => {
    // getRelatedListings should use .not('status', 'in', '(sold,reserved)')
    expect(SOURCE).toContain(".not('status', 'in', '(sold,reserved)')")
  })
})

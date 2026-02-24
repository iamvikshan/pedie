import { describe, test, expect, mock } from 'bun:test'
import {
  getFeaturedListings,
  getLatestListings,
  getListingsByCategory,
  getDealListings,
} from '@lib/data/products'

// Mock the server client
mock.module('@lib/supabase/server', () => ({
  createClient: mock(() =>
    Promise.resolve({
      from: mock(table => {
        if (table === 'categories') {
          return {
            select: mock(() => ({
              eq: mock(() => ({
                single: mock(() =>
                  Promise.resolve({
                    data: { id: 'cat-1' },
                    error: null,
                  })
                ),
              })),
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

            const eqMock = mock(() => {
              const eqResult = {
                eq: mock(() => {
                  const eq2Result = {
                    order: mock(() => ({
                      limit: mock(() =>
                        Promise.resolve({ data: mockData, error: null })
                      ),
                    })),
                  }
                  return Object.assign(
                    Promise.resolve({ data: mockData, error: null }),
                    eq2Result
                  )
                }),
                order: mock(() => ({
                  limit: mock(() =>
                    Promise.resolve({ data: mockData, error: null })
                  ),
                })),
                limit: mock(() =>
                  Promise.resolve({ data: mockData, error: null })
                ),
              }
              return Object.assign(
                Promise.resolve({ data: mockData, error: null }),
                eqResult
              )
            })

            return { eq: eqMock }
          }),
        }
      }),
    })
  ),
}))

describe('Products Data Functions', () => {
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
})

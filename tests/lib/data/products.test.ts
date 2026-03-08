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
                sku: 'L1',
                price_kes: 50000,
                sale_price_kes: null,
                product: { name: 'Phone A', brand: { name: 'Apple' } },
              },
              {
                id: '2',
                sku: 'L2',
                price_kes: 40000,
                sale_price_kes: null,
                product: { name: 'Phone B', brand: { name: 'Samsung' } },
              },
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
    expect(listings[0].sku).toBe('L1')
  })

  test('getLatestListings returns listings', async () => {
    const listings = await getLatestListings()
    expect(Array.isArray(listings)).toBe(true)
    expect(listings.length).toBe(2)
    expect(listings[0].sku).toBe('L1')
  })

  test('getListingsByCategory returns listings', async () => {
    const listings = await getListingsByCategory('phones')
    expect(Array.isArray(listings)).toBe(true)
    expect(listings.length).toBe(2)
    expect(listings[0].sku).toBe('L1')
  })

  test('getRelatedListings uses active status filter', () => {
    expect(SOURCE).toContain(".eq('status', 'active')")
  })
})

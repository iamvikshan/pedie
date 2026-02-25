import { describe, test, expect, mock, beforeEach, afterAll } from 'bun:test'
import type { CompetitorName } from '../../../scripts/crawlers/types'

const originalFetch = globalThis.fetch

// Mock fetch globally for fetchWithRetry tests
const mockFetch = mock(() =>
  Promise.resolve(new Response('ok', { status: 200 }))
)

// ── Import after environment is set ────────────────────────────────────────

const {
  parseKesPrice,
  parseUsdPrice,
  rateLimiter,
  fetchWithRetry,
  getProductCatalog,
  upsertPriceComparisons,
} = await import('../../../scripts/crawlers/utils')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Crawler Utils', () => {
  describe('parseKesPrice', () => {
    test('parses "KES 45,000"', () => {
      expect(parseKesPrice('KES 45,000')).toBe(45000)
    })

    test('parses "Ksh45000"', () => {
      expect(parseKesPrice('Ksh45000')).toBe(45000)
    })

    test('parses "Ksh 45,000"', () => {
      expect(parseKesPrice('Ksh 45,000')).toBe(45000)
    })

    test('parses "45,000"', () => {
      expect(parseKesPrice('45,000')).toBe(45000)
    })

    test('parses "KES 1,234,567"', () => {
      expect(parseKesPrice('KES 1,234,567')).toBe(1234567)
    })

    test('parses plain number "45000"', () => {
      expect(parseKesPrice('45000')).toBe(45000)
    })

    test('returns null for invalid input', () => {
      expect(parseKesPrice('no price here')).toBeNull()
    })

    test('returns null for empty string', () => {
      expect(parseKesPrice('')).toBeNull()
    })
  })

  describe('parseUsdPrice', () => {
    test('parses "$499.99"', () => {
      expect(parseUsdPrice('$499.99')).toBe(499.99)
    })

    test('parses "USD 499"', () => {
      expect(parseUsdPrice('USD 499')).toBe(499)
    })

    test('parses "$1,299.00"', () => {
      expect(parseUsdPrice('$1,299.00')).toBe(1299)
    })

    test('parses "US$ 350"', () => {
      expect(parseUsdPrice('US$ 350')).toBe(350)
    })

    test('returns null for invalid input', () => {
      expect(parseUsdPrice('no price here')).toBeNull()
    })

    test('returns null for empty string', () => {
      expect(parseUsdPrice('')).toBeNull()
    })
  })

  describe('rateLimiter', () => {
    test('delays execution', async () => {
      const start = Date.now()
      await rateLimiter(50)
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(40) // allow small timing variance
    })
  })

  describe('fetchWithRetry', () => {
    beforeEach(() => {
      mockFetch.mockClear()
    })

    afterAll(() => {
      globalThis.fetch = originalFetch
    })

    test('returns response on success', async () => {
      globalThis.fetch = mockFetch as unknown as typeof fetch
      const response = await fetchWithRetry('https://example.com')
      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    test('retries on failure', async () => {
      let callCount = 0
      globalThis.fetch = mock(() => {
        callCount++
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve(new Response('ok', { status: 200 }))
      }) as unknown as typeof fetch

      const response = await fetchWithRetry('https://example.com', {}, 3, 10)
      expect(response.status).toBe(200)
      expect(callCount).toBe(3)
    })

    test('throws after max retries', async () => {
      globalThis.fetch = mock(() =>
        Promise.reject(new Error('Network error'))
      ) as unknown as typeof fetch

      await expect(
        fetchWithRetry('https://example.com', {}, 2, 10)
      ).rejects.toThrow('Network error')
    })

    test('retries on 5xx response', async () => {
      let callCount = 0
      globalThis.fetch = mock(() => {
        callCount++
        if (callCount < 3) {
          return Promise.resolve(
            new Response('Server Error', { status: 500, statusText: 'Internal Server Error' })
          )
        }
        return Promise.resolve(new Response('ok', { status: 200 }))
      }) as unknown as typeof fetch

      const response = await fetchWithRetry('https://example.com', {}, 3, 10)
      expect(response.status).toBe(200)
      expect(callCount).toBe(3)
    })

    test('retries on 429 response', async () => {
      let callCount = 0
      globalThis.fetch = mock(() => {
        callCount++
        if (callCount < 2) {
          return Promise.resolve(
            new Response('Too Many Requests', { status: 429, statusText: 'Too Many Requests' })
          )
        }
        return Promise.resolve(new Response('ok', { status: 200 }))
      }) as unknown as typeof fetch

      const response = await fetchWithRetry('https://example.com', {}, 3, 10)
      expect(response.status).toBe(200)
      expect(callCount).toBe(2)
    })

    test('throws immediately on 4xx (non-429) response', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response('Not Found', { status: 404, statusText: 'Not Found' })
        )
      ) as unknown as typeof fetch

      await expect(
        fetchWithRetry('https://example.com', {}, 3, 10)
      ).rejects.toThrow('HTTP 404')
    })

    test('throws after max retries on persistent 5xx', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response('Server Error', { status: 500, statusText: 'Internal Server Error' })
        )
      ) as unknown as typeof fetch

      await expect(
        fetchWithRetry('https://example.com', {}, 2, 10)
      ).rejects.toThrow('HTTP 500')
    })
  })

  describe('getProductCatalog', () => {
    test('returns products with active listings', async () => {
      const mockSelect = mock(() => ({
        eq: mock(() => ({
          data: [
            {
              id: 'p1',
              brand: 'Apple',
              model: 'iPhone 15',
              slug: 'apple-iphone-15',
            },
          ],
          error: null,
        })),
      }))

      const mockSupabase = {
        from: mock(() => ({
          select: mockSelect,
        })),
      }

      const products = await getProductCatalog(mockSupabase as never)
      expect(products).toHaveLength(1)
      expect(products[0].brand).toBe('Apple')
    })

    test('returns empty array on error', async () => {
      const mockSelect = mock(() => ({
        eq: mock(() => ({
          data: null,
          error: { message: 'DB error' },
        })),
      }))

      const mockSupabase = {
        from: mock(() => ({
          select: mockSelect,
        })),
      }

      const products = await getProductCatalog(mockSupabase as never)
      expect(products).toHaveLength(0)
    })
  })

  describe('upsertPriceComparisons', () => {
    test('upserts comparisons to Supabase', async () => {
      const mockUpsert = mock(() => ({
        error: null,
      }))

      const mockSupabase = {
        from: mock(() => ({
          upsert: mockUpsert,
        })),
      }

      const comparisons = [
        {
          product_id: 'p1',
          competitor: 'badili' as CompetitorName,
          competitor_price_kes: 45000,
          url: 'https://badili.ke/product',
          crawled_at: '2025-06-01T10:00:00Z',
        },
      ]

      await upsertPriceComparisons(mockSupabase as never, comparisons)
      expect(mockUpsert).toHaveBeenCalledTimes(1)
    })

    test('handles empty comparisons', async () => {
      const mockUpsert = mock(() => ({
        error: null,
      }))

      const mockSupabase = {
        from: mock(() => ({
          upsert: mockUpsert,
        })),
      }

      await upsertPriceComparisons(mockSupabase as never, [])
      // Should not call upsert for empty array
      expect(mockUpsert).not.toHaveBeenCalled()
    })
  })
})

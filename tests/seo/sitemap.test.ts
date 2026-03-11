import { beforeEach, describe, expect, mock, test } from 'bun:test'

// Mock @lib/supabase/admin before importing sitemap
const mockSelect = mock(() =>
  Promise.resolve({ data: [], error: null })
) as ReturnType<typeof mock>
const mockEq = mock(() =>
  Promise.resolve({ data: [], error: null })
) as ReturnType<typeof mock>

const mockFrom = mock((table: string) => {
  if (table === 'categories') {
    return { select: mockSelect }
  }
  if (table === 'listings') {
    return {
      select: () => ({
        eq: mockEq,
      }),
    }
  }
  return { select: mockSelect }
})

mock.module('@lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}))

// Now import sitemap after mocking
const { default: sitemap } = await import('@/app/sitemap')

describe('sitemap', () => {
  beforeEach(() => {
    mockSelect.mockReset()
    mockEq.mockReset()
    mockFrom.mockReset()

    // Default: return empty data
    mockSelect.mockImplementation(() =>
      Promise.resolve({ data: [], error: null })
    )
    mockEq.mockImplementation(() => Promise.resolve({ data: [], error: null }))
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') {
        return { select: mockSelect }
      }
      if (table === 'listings') {
        return {
          select: () => ({
            eq: mockEq,
          }),
        }
      }
      return { select: mockSelect }
    })
  })

  test('includes static pages', async () => {
    const result = await sitemap()
    const urls = result.map(entry => entry.url)
    expect(urls).toContain('https://pedie.tech')
    expect(urls).toContain('https://pedie.tech/search')
  })

  test('maps categories correctly', async () => {
    mockSelect.mockImplementation(() =>
      Promise.resolve({
        data: [
          { slug: 'smartphones', updated_at: '2025-06-01T00:00:00Z' },
          { slug: 'laptops', updated_at: '2025-06-01T00:00:00Z' },
        ],
        error: null,
      })
    )
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') {
        return { select: mockSelect }
      }
      if (table === 'listings') {
        return {
          select: () => ({
            eq: mockEq,
          }),
        }
      }
      return { select: mockSelect }
    })

    const result = await sitemap()
    const urls = result.map(entry => entry.url)
    expect(urls).toContain('https://pedie.tech/collections/smartphones')
    expect(urls).toContain('https://pedie.tech/collections/laptops')
  })

  test('maps listings correctly', async () => {
    mockEq.mockImplementation(() =>
      Promise.resolve({
        data: [
          { sku: 'PD-ABC12', updated_at: '2025-06-01T00:00:00Z' },
          { sku: 'PD-DEF34', updated_at: '2025-06-01T00:00:00Z' },
        ],
        error: null,
      })
    )
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') {
        return { select: mockSelect }
      }
      if (table === 'listings') {
        return {
          select: () => ({
            eq: mockEq,
          }),
        }
      }
      return { select: mockSelect }
    })

    const result = await sitemap()
    const urls = result.map(entry => entry.url)
    expect(urls).toContain('https://pedie.tech/listings/PD-ABC12')
    expect(urls).toContain('https://pedie.tech/listings/PD-DEF34')
  })

  test('handles empty data gracefully', async () => {
    const result = await sitemap()
    // Should still have static pages
    expect(result.length).toBeGreaterThanOrEqual(2)
    const urls = result.map(entry => entry.url)
    expect(urls).toContain('https://pedie.tech')
  })

  test('handles null data gracefully', async () => {
    mockSelect.mockImplementation(() =>
      Promise.resolve({ data: null, error: null })
    )
    mockEq.mockImplementation(() =>
      Promise.resolve({ data: null, error: null })
    )
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') {
        return { select: mockSelect }
      }
      if (table === 'listings') {
        return {
          select: () => ({
            eq: mockEq,
          }),
        }
      }
      return { select: mockSelect }
    })

    const result = await sitemap()
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  test('static pages have correct priorities', async () => {
    const result = await sitemap()
    const homePage = result.find(e => e.url === 'https://pedie.tech')
    const searchPage = result.find(e => e.url === 'https://pedie.tech/search')
    expect(homePage?.priority).toBe(1)
    expect(searchPage?.priority).toBe(0.8)
  })

  test('category pages have correct priority', async () => {
    mockSelect.mockImplementation(() =>
      Promise.resolve({
        data: [{ slug: 'smartphones', updated_at: '2025-06-01T00:00:00Z' }],
        error: null,
      })
    )
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') {
        return { select: mockSelect }
      }
      if (table === 'listings') {
        return {
          select: () => ({
            eq: mockEq,
          }),
        }
      }
      return { select: mockSelect }
    })

    const result = await sitemap()
    const catPage = result.find(
      e => e.url === 'https://pedie.tech/collections/smartphones'
    )
    expect(catPage?.priority).toBe(0.9)
  })
})

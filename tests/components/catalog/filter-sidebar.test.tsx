import { describe, expect, mock, test } from 'bun:test'
import type { AvailableFilters, ListingFilters } from '@app-types/filters'
import { FilterSidebar } from '@components/catalog/filterSidebar'
import React from 'react'
import { renderToString } from 'react-dom/server'

// Mock next/navigation
mock.module('next/navigation', () => ({
  useRouter: mock(() => ({ push: mock(), replace: mock(), back: mock() })),
  useSearchParams: mock(() => new URLSearchParams()),
  usePathname: mock(() => '/collections/smartphones'),
}))

const mockAvailableFilters: AvailableFilters = {
  conditions: ['excellent', 'good'],
  brands: ['Apple', 'Samsung'],
  storages: ['128GB', '256GB'],
  colors: ['Black', 'White'],
  carriers: ['Unlocked'],
  priceRange: { min: 10000, max: 100000 },
}

describe('FilterSidebar', () => {
  test('renders condition filter options', () => {
    const currentFilters: ListingFilters = {}
    const html = renderToString(
      <FilterSidebar
        availableFilters={mockAvailableFilters}
        currentFilters={currentFilters}
        categorySlug='smartphones'
      />
    )

    expect(html).toContain('Condition')
    expect(html).toContain('excellent')
    expect(html).toContain('good')
  })

  test('renders brand/storage/color options from available filters', () => {
    const currentFilters: ListingFilters = {}
    const html = renderToString(
      <FilterSidebar
        availableFilters={mockAvailableFilters}
        currentFilters={currentFilters}
        categorySlug='smartphones'
      />
    )

    expect(html).toContain('Brand')
    expect(html).toContain('Apple')
    expect(html).toContain('Samsung')

    expect(html).toContain('Storage')
    expect(html).toContain('128GB')
    expect(html).toContain('256GB')

    expect(html).toContain('Color')
    expect(html).toContain('Black')
    expect(html).toContain('White')
  })

  test('shows correct checked state from current filters', () => {
    const currentFilters: ListingFilters = {
      condition: ['excellent'],
      brand: ['Apple'],
    }
    const html = renderToString(
      <FilterSidebar
        availableFilters={mockAvailableFilters}
        currentFilters={currentFilters}
        categorySlug='smartphones'
      />
    )

    // In React 18/19 renderToString, checked attributes are rendered as checked=""
    // Verify exactly 2 checkboxes are checked (excellent condition + Apple brand)
    const checkedCount = (html.match(/checked=""/g) || []).length
    expect(checkedCount).toBe(2)
  })
})

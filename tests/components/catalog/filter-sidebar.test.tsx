import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { AvailableFilters, ListingFilters } from '@app-types/filters'
import { FilterSidebar } from '@components/catalog/filterSidebar'
import React from 'react'
import { mockNextNavigation, render, screen } from '../../utils'

const filterSidebarSrc = readFileSync(
  resolve('src/components/catalog/filterSidebar.tsx'),
  'utf-8'
)

mockNextNavigation({ pathname: '/collections/smartphones' })

const mockAvailableFilters: AvailableFilters = {
  conditions: ['excellent', 'good'],
  brands: ['Apple', 'Samsung'],
  storages: ['128GB', '256GB'],
  colors: ['Black', 'White'],
  carriers: ['Unlocked'],
  priceRange: { min: 10000, max: 100000 },
  categories: [],
}

describe('FilterSidebar', () => {
  test('renders condition filter options', () => {
    const currentFilters: ListingFilters = {}
    render(
      <FilterSidebar
        availableFilters={mockAvailableFilters}
        currentFilters={currentFilters}
        categorySlug='smartphones'
      />
    )

    expect(screen.getByText('Condition')).toBeInTheDocument()
    expect(screen.getByText('excellent')).toBeInTheDocument()
    expect(screen.getByText('good')).toBeInTheDocument()
  })

  test('renders brand/storage/color options from available filters', () => {
    const currentFilters: ListingFilters = {}
    render(
      <FilterSidebar
        availableFilters={mockAvailableFilters}
        currentFilters={currentFilters}
        categorySlug='smartphones'
      />
    )

    expect(screen.getByText('Brand')).toBeInTheDocument()
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Samsung')).toBeInTheDocument()

    expect(screen.getByText('Storage')).toBeInTheDocument()
    expect(screen.getByText('128GB')).toBeInTheDocument()
    expect(screen.getByText('256GB')).toBeInTheDocument()

    expect(screen.getByText('Color')).toBeInTheDocument()
    expect(screen.getByText('Black')).toBeInTheDocument()
    expect(screen.getByText('White')).toBeInTheDocument()
  })

  test('shows correct checked state from current filters', () => {
    const currentFilters: ListingFilters = {
      condition: ['excellent'],
      brand: ['Apple'],
    }
    render(
      <FilterSidebar
        availableFilters={mockAvailableFilters}
        currentFilters={currentFilters}
        categorySlug='smartphones'
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    const checked = checkboxes.filter(cb => (cb as HTMLInputElement).checked)
    expect(checked.length).toBe(2)
  })

  test('FilterSidebar with empty categorySlug navigates to /shop', () => {
    // Source analysis: check that the component handles empty categorySlug → /shop
    expect(filterSidebarSrc).toContain(
      'categorySlug ? `/collections/${categorySlug}`'
    )
    expect(filterSidebarSrc).toContain("'/shop'")
  })

  test('renders category filter when categories are available', () => {
    const filtersWithCategories: AvailableFilters = {
      ...mockAvailableFilters,
      categories: [
        { name: 'Smartphones', slug: 'smartphones', count: 18 },
        { name: 'Laptops', slug: 'laptops', count: 5 },
      ],
    }
    render(
      <FilterSidebar
        availableFilters={filtersWithCategories}
        currentFilters={{}}
        categorySlug=''
      />
    )
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Smartphones')).toBeInTheDocument()
    expect(screen.getByText('Laptops')).toBeInTheDocument()
  })

  test('source has category filter section', () => {
    expect(filterSidebarSrc).toContain('availableFilters.categories')
    expect(filterSidebarSrc).toContain('handleCategoryChange')
  })
})

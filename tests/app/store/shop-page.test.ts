import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve('src/app/(store)/shop/page.tsx'), 'utf-8')

describe('Shop Page', () => {
  test('file exists and is a server component (no use client directive)', () => {
    expect(src).not.toContain("'use client'")
    expect(src).not.toContain('"use client"')
  })

  test('calls getFilteredListings with null categorySlug', () => {
    expect(src).toContain('getFilteredListings(null')
  })

  test('calls getAvailableFilters with null categorySlug', () => {
    expect(src).toContain('getAvailableFilters(null')
  })

  test('renders Breadcrumbs component', () => {
    expect(src).toContain('Breadcrumbs')
    expect(src).toContain('<Breadcrumbs')
  })

  test('renders FilterSidebar component', () => {
    expect(src).toContain('FilterSidebar')
    expect(src).toContain('<FilterSidebar')
  })

  test('renders ProductGrid component', () => {
    expect(src).toContain('ProductGrid')
    expect(src).toContain('<ProductGrid')
  })

  test('exports metadata with title containing Shop', () => {
    expect(src).toContain('export const metadata')
    expect(src).toContain('Shop All Products')
  })

  test('passes empty categorySlug to FilterSidebar for shop page', () => {
    expect(src).toContain("categorySlug=''")
  })

  test('renders SortDropdown and Pagination', () => {
    expect(src).toContain('<SortDropdown')
    expect(src).toContain('<Pagination')
  })

  test('renders ActiveFilters', () => {
    expect(src).toContain('<ActiveFilters')
  })
})

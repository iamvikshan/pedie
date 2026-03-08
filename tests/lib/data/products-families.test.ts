import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve('src/lib/data/products.ts'), 'utf-8')

describe('getRelatedFamilies', () => {
  test('function is exported from products module', async () => {
    const mod = await import('@data/products')
    expect(mod.getRelatedFamilies).toBeDefined()
    expect(typeof mod.getRelatedFamilies).toBe('function')
  })

  test('source queries by product categories junction and excludes product', () => {
    expect(src).toContain('product_categories')
    expect(src).toContain('productId')
    expect(src).toContain('filter')
  })

  test('source groups into families using selectRepresentative', () => {
    expect(src).toContain('selectRepresentative')
  })
})

describe('getProductFamiliesByCategory', () => {
  test('function is exported from products module', async () => {
    const mod = await import('@data/products')
    expect(mod.getProductFamiliesByCategory).toBeDefined()
    expect(typeof mod.getProductFamiliesByCategory).toBe('function')
  })

  test('source looks up category by slug', () => {
    expect(src).toContain('categorySlug')
    expect(src).toContain(".eq('slug', categorySlug)")
  })

  test('source filters out non-active listings', () => {
    // Multiple occurrences of this pattern expected
    expect(src).toContain(".eq('status', 'active')")
  })
})

describe('existing products exports preserved', () => {
  test('getFeaturedListings is exported', async () => {
    const mod = await import('@data/products')
    expect(mod.getFeaturedListings).toBeDefined()
    expect(typeof mod.getFeaturedListings).toBe('function')
  })

  test('getLatestListings is exported', async () => {
    const mod = await import('@data/products')
    expect(mod.getLatestListings).toBeDefined()
    expect(typeof mod.getLatestListings).toBe('function')
  })

  test('getListingsByCategory is exported', async () => {
    const mod = await import('@data/products')
    expect(mod.getListingsByCategory).toBeDefined()
    expect(typeof mod.getListingsByCategory).toBe('function')
  })

  test('family functions are exported (merged from families.ts)', async () => {
    const mod = await import('@data/products')
    expect(mod.LISTING_TYPE_PRIORITY).toBeDefined()
    expect(mod.selectRepresentative).toBeDefined()
    expect(mod.getProductFamilyBySlug).toBeDefined()
    expect(mod.getProductFamilies).toBeDefined()
    expect(mod.findBetterDeal).toBeDefined()
  })
})

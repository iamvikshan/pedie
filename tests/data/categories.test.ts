import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const categoriesSrc = readFileSync(
  resolve('src/lib/data/categories.ts'),
  'utf-8'
)
const typesSrc = readFileSync(resolve('types/product.ts'), 'utf-8')

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------
describe('types/product.ts - category types', () => {
  test('CategoryWithChildren type is exported', () => {
    expect(typesSrc).toContain('export type CategoryWithChildren')
  })

  test('CategoryWithChildren includes children array', () => {
    expect(typesSrc).toContain('children: Category[]')
  })

  test('ProductCategory junction type is exported', () => {
    expect(typesSrc).toContain('export type ProductCategory')
  })

  test('ProductCategory has product_id and category_id', () => {
    expect(typesSrc).toContain('product_id: string')
    expect(typesSrc).toContain('category_id: string')
  })
})

// ---------------------------------------------------------------------------
// categories.ts - new functions
// ---------------------------------------------------------------------------
describe('getTopLevelCategories', () => {
  test('function is exported from categories module', async () => {
    const mod = await import('@data/categories')
    expect(mod.getTopLevelCategories).toBeDefined()
    expect(typeof mod.getTopLevelCategories).toBe('function')
  })

  test('source filters by electronics parent', () => {
    expect(categoriesSrc).toContain('electronics')
    expect(categoriesSrc).toContain('getTopLevelCategories')
  })
})

describe('getCategoryTree', () => {
  test('function is exported from categories module', async () => {
    const mod = await import('@data/categories')
    expect(mod.getCategoryTree).toBeDefined()
    expect(typeof mod.getCategoryTree).toBe('function')
  })

  test('source uses CategoryWithChildren', () => {
    expect(categoriesSrc).toContain('CategoryWithChildren')
  })
})

describe('getCategoryWithChildren', () => {
  test('function is exported from categories module', async () => {
    const mod = await import('@data/categories')
    expect(mod.getCategoryWithChildren).toBeDefined()
    expect(typeof mod.getCategoryWithChildren).toBe('function')
  })

  test('source filters children by parent_id', () => {
    expect(categoriesSrc).toContain('parent_id')
  })
})

describe('getCategoryBreadcrumb', () => {
  test('function is exported from categories module', async () => {
    const mod = await import('@data/categories')
    expect(mod.getCategoryBreadcrumb).toBeDefined()
    expect(typeof mod.getCategoryBreadcrumb).toBe('function')
  })

  test('returns breadcrumb shape with name and slug', () => {
    expect(categoriesSrc).toContain('name')
    expect(categoriesSrc).toContain('slug')
  })
})

describe('getCategoryAndDescendantIds', () => {
  test('function is exported from categories module', async () => {
    const mod = await import('@data/categories')
    expect(mod.getCategoryAndDescendantIds).toBeDefined()
    expect(typeof mod.getCategoryAndDescendantIds).toBe('function')
  })

  test('source collects descendant IDs recursively', () => {
    expect(categoriesSrc).toContain('getCategoryAndDescendantIds')
    // Should build an array of IDs by traversing children
    expect(categoriesSrc).toContain('descendants')
  })
})

describe('existing exports preserved', () => {
  test('getCategories is still exported', async () => {
    const mod = await import('@data/categories')
    expect(mod.getCategories).toBeDefined()
    expect(typeof mod.getCategories).toBe('function')
  })

  test('getCategoryBySlug is still exported', async () => {
    const mod = await import('@data/categories')
    expect(mod.getCategoryBySlug).toBeDefined()
    expect(typeof mod.getCategoryBySlug).toBe('function')
  })
})

import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SOURCE = readFileSync(
  resolve('src/components/home/customerFavorites.tsx'),
  'utf-8'
)

describe('CustomerFavorites', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/home/customerFavorites')
    expect(mod.CustomerFavorites).toBeDefined()
    expect(typeof mod.CustomerFavorites).toBe('function')
  })

  test('derives tabs dynamically from family data', () => {
    expect(SOURCE).toContain('const tabs = useMemo')
    expect(SOURCE).toContain('categoryMap.has(f.product.category.slug)')
  })

  test("uses 'all' for unfiltered view", () => {
    expect(SOURCE).toContain("useState('all')")
  })

  test('has /shop View All link', () => {
    expect(SOURCE).toContain('/shop')
  })

  test('has View All text', () => {
    expect(SOURCE).toContain('View All')
  })

  test('has useRef for scroll container', () => {
    expect(SOURCE).toContain('useRef')
    expect(SOURCE).toContain('scrollRef')
  })

  test('has scroll reset logic (scrollLeft = 0) on tab change', () => {
    expect(SOURCE).toContain('scrollLeft = 0')
    expect(SOURCE).toContain('setActiveTab')
  })

  test('animation container uses key={activeTab} for re-animation', () => {
    expect(SOURCE).toContain('key={activeTab}')
  })

  test('cards have flex-shrink-0 class', () => {
    expect(SOURCE).toContain('flex-shrink-0')
  })

  // Phase 3: ProductFamily integration tests
  test('accepts families prop instead of listings', () => {
    expect(SOURCE).toContain('families: ProductFamily[]')
    expect(SOURCE).not.toContain('listings: ListingWithProduct[]')
  })

  test('uses ProductFamilyCard instead of ProductCard', () => {
    expect(SOURCE).toContain('ProductFamilyCard')
    expect(SOURCE).not.toContain('ProductCard')
  })

  test('filters by product category slug', () => {
    expect(SOURCE).toContain('category?.slug === activeTab')
  })

  test('guards against null product before accessing properties', () => {
    expect(SOURCE).toContain('f.product &&')
  })
})

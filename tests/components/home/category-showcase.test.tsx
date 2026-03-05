import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SOURCE = readFileSync(
  resolve('src/components/home/categoryShowcase.tsx'),
  'utf-8'
)

describe('CategoryShowcase', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/home/categoryShowcase')
    expect(mod.CategoryShowcase).toBeDefined()
    expect(typeof mod.CategoryShowcase).toBe('function')
  })

  test('uses ProductFamilyCard instead of ProductCard', () => {
    expect(SOURCE).toContain('ProductFamilyCard')
    expect(SOURCE).not.toContain('ProductCard')
  })

  test('uses getProductFamiliesByCategory', () => {
    expect(SOURCE).toContain('getProductFamiliesByCategory')
    expect(SOURCE).not.toContain('getListingsByCategory')
  })
})

describe('CategoryShowcaseWrapper', () => {
  test('module exports the wrapper component', async () => {
    const mod = await import('@components/home/categoryShowcaseWrapper')
    expect(mod.CategoryShowcaseWrapper).toBeDefined()
    expect(typeof mod.CategoryShowcaseWrapper).toBe('function')
  })

  test('exports ViewAllArrow component', async () => {
    const mod = await import('@components/home/categoryShowcaseWrapper')
    expect(mod.ViewAllArrow).toBeDefined()
    expect(typeof mod.ViewAllArrow).toBe('function')
  })
})

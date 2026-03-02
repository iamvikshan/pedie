import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const source = readFileSync(
  resolve('src/components/search/filterSidebar.tsx'),
  'utf-8'
)

describe('FilterSidebar', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/search/filterSidebar')
    expect(mod.FilterSidebar).toBeDefined()
    expect(typeof mod.FilterSidebar).toBe('function')
  })

  test('uses TbFilter icon', () => {
    expect(source).toContain('TbFilter')
  })

  test('has condition filter section', () => {
    expect(source).toContain('Condition')
    expect(source).toContain('checkbox')
  })

  test('has brand filter section', () => {
    expect(source).toContain('Brand')
  })

  test('has storage filter section', () => {
    expect(source).toContain('Storage')
  })

  test('has price range inputs', () => {
    expect(source).toContain('Price Range')
    expect(source).toContain('priceMin')
    expect(source).toContain('priceMax')
  })

  test('has clear all filters button', () => {
    expect(source).toContain('Clear all filters')
  })

  test('has mobile drawer overlay', () => {
    expect(source).toContain('lg:hidden')
    expect(source).toContain('fixed inset-0')
  })

  test('has desktop sidebar', () => {
    expect(source).toContain('lg:block')
    expect(source).toContain('sticky')
  })

  test('has close button for mobile drawer', () => {
    expect(source).toContain('TbX')
    expect(source).toContain("aria-label='Close filters'")
  })

  test('shows active filter count badge', () => {
    expect(source).toContain('bg-pedie-green')
    expect(source).toContain('rounded-full')
  })
})

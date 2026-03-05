import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const src = readFileSync(
  resolve('src/components/layout/categoryNav.tsx'),
  'utf-8'
)

describe('CategoryNav', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/categoryNav')
    expect(mod.CategoryNav).toBeDefined()
    expect(typeof mod.CategoryNav).toBe('function')
  })

  test('accepts categories and categoryTree props', () => {
    expect(src).toContain('categories: Category[]')
    expect(src).toContain('categoryTree: CategoryWithChildren[]')
  })

  test('renders dynamic categories from props', () => {
    expect(src).toContain('categories.map')
    expect(src).toContain('/collections/${cat.slug}')
  })

  test('does not export a hardcoded CATEGORIES constant', async () => {
    const mod = await import('@components/layout/categoryNav')
    expect((mod as Record<string, unknown>).CATEGORIES).toBeUndefined()
  })

  test('integrates MegaMenu component', () => {
    expect(src).toContain('MegaMenu')
    expect(src).toContain('activeCategory')
  })

  test('tracks hover state for mega-menu', () => {
    expect(src).toContain('useState')
    expect(src).toContain('setActiveCategory')
  })
})

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

  test('uses text-xs font size for compact nav', () => {
    expect(src).toContain('text-xs')
    expect(src).not.toContain('text-sm')
  })

  test('does not use animated underline span', () => {
    // No underline span — clean hover via transition-colors only
    expect(src).not.toContain('scale-x-0')
    expect(src).not.toContain('scale-x-100')
    expect(src).not.toContain('origin-left')
    expect(src).not.toContain('h-0.5')
  })

  test('uses transition-colors hover without group/relative', () => {
    expect(src).toContain('transition-colors')
    expect(src).toContain('hover:text-pedie-green')
    expect(src).not.toContain('group relative')
  })

  test('nav links have horizontal padding', () => {
    expect(src).toContain('px-3')
  })
})

import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const src = readFileSync(resolve('src/components/layout/megaMenu.tsx'), 'utf-8')

describe('MegaMenu', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/megaMenu')
    expect(mod.MegaMenu).toBeDefined()
    expect(typeof mod.MegaMenu).toBe('function')
  })

  test('is a client component', () => {
    expect(src).toContain("'use client'")
  })

  test('accepts categories, activeCategory, and onClose props', () => {
    expect(src).toContain('categories: CategoryWithChildren[]')
    expect(src).toContain('activeCategory: string | null')
    expect(src).toContain('onClose: () => void')
  })

  test('returns null when no activeCategory', () => {
    expect(src).toContain('if (!activeCategory) return null')
  })

  test('returns null when active category has no children', () => {
    expect(src).toContain('activeData.children.length === 0')
  })

  test('renders subcategory links with collection hrefs', () => {
    expect(src).toContain('/collections/${child.slug}')
    expect(src).toContain('child.name')
  })

  test('uses responsive grid layout', () => {
    expect(src).toContain('grid-cols-2')
    expect(src).toContain('md:grid-cols-4')
  })

  test('uses glassmorphism styling', () => {
    expect(src).toContain('bg-pedie-glass')
    expect(src).toContain('backdrop-blur-xl')
    expect(src).toContain('border-pedie-glass-border')
  })

  test('closes on mouse leave', () => {
    expect(src).toContain('onMouseLeave={onClose}')
  })

  test('uses pedie design tokens for hover states', () => {
    expect(src).toContain('hover:bg-pedie-surface')
    expect(src).toContain('group-hover:text-pedie-green')
  })

  test('shows description when available', () => {
    expect(src).toContain('child.description')
    expect(src).toContain('text-pedie-text-muted')
  })
})

describe('HeaderWrapper', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/headerWrapper')
    expect(mod.HeaderWrapper).toBeDefined()
    expect(typeof mod.HeaderWrapper).toBe('function')
  })

  test('is a server component (no use client directive)', () => {
    const wrapperSrc = readFileSync(
      resolve('src/components/layout/headerWrapper.tsx'),
      'utf-8'
    )
    expect(wrapperSrc).not.toContain("'use client'")
    expect(wrapperSrc).toContain('getTopLevelCategories')
    expect(wrapperSrc).toContain('getCategoryTree')
  })
})

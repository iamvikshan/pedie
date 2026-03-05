import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const src = readFileSync(
  resolve('src/components/layout/allItemsPanel.tsx'),
  'utf-8'
)

describe('AllItemsPanel', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/allItemsPanel')
    expect(mod.AllItemsPanel).toBeDefined()
    expect(typeof mod.AllItemsPanel).toBe('function')
  })

  test('uses TbFlame icon instead of emoji for deals', () => {
    expect(src).toContain('TbFlame')
    expect(src).toContain('Hot Deals')
    expect(src).not.toContain('🔥')
    expect(src).not.toContain('Daily Deals')
  })

  test('imports brand data from brands.json', () => {
    expect(src).toContain('brands.json')
    expect(src).toContain('brand.slug')
    expect(src).toContain('brand.logo')
    expect(src).toContain('brand.name')
  })

  test('renders brand logos with Image component', () => {
    expect(src).toContain("import Image from 'next/image'")
    expect(src).toContain('brand.logo')
  })

  test('has accessible dialog role', () => {
    expect(src).toContain("role='dialog'")
    expect(src).toContain("aria-modal='true'")
  })

  test('has category cards with images and gradient overlay', () => {
    expect(src).toContain('CATEGORY_IMAGES')
    expect(src).toContain('group-hover:scale-105')
    expect(src).toContain('bg-gradient-to-t')
  })

  test('accepts categories prop of type Category[]', () => {
    expect(src).toContain('categories: Category[]')
    expect(src).toContain('categories.map')
  })

  test('renders dynamic categories from prop, not hardcoded CATEGORIES', () => {
    expect(src).not.toContain('CATEGORIES.map')
    expect(src).toContain('categories.map')
    expect(src).toContain('/collections/${cat.slug}')
  })

  test('traps focus within panel', () => {
    expect(src).toContain('Tab')
    expect(src).toContain('Escape')
    expect(src).toContain('focusable')
  })
})

describe('AllItemsPanel Popular Brands redesign', () => {
  test('brands section does NOT use dark:invert class', () => {
    expect(src).not.toContain('dark:invert')
  })

  test('brands section uses theme-aware bg-pedie-card class', () => {
    expect(src).toContain('bg-pedie-card')
  })

  test('brands section uses theme-aware border-pedie-border class', () => {
    expect(src).toContain('border-pedie-border')
  })

  test('brands layout uses grid for logo-only card display', () => {
    expect(src).toContain('grid-cols-3')
  })

  test('brands use card-style layout with rounded-2xl', () => {
    expect(src).toContain('rounded-2xl')
    expect(src).toContain('bg-pedie-card')
  })

  test('brand logos display at sufficient size without brand name text', () => {
    // Logo-only cards — no brand name span, large logo dimensions
    expect(src).toContain('width={80}')
    expect(src).toContain('height={32}')
    expect(src).not.toContain('group-hover:text-pedie-green')
  })

  test('brand hover uses pedie-green accent', () => {
    expect(src).toContain('border-pedie-green/30')
    expect(src).toContain('hover:bg-pedie-card-hover')
  })

  test('brand logos have subtle opacity transition on hover', () => {
    expect(src).toContain('opacity-70')
    expect(src).toContain('group-hover:opacity-100')
  })

  test('does not use glass-border for brand items', () => {
    // The redesign replaces glass-border with pedie-border on brand items
    const brandsSection = src.slice(src.indexOf('Popular Brands'))
    expect(brandsSection).not.toContain('border-pedie-glass-border')
  })
})

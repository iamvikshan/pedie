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

  test('traps focus within panel', () => {
    expect(src).toContain('Tab')
    expect(src).toContain('Escape')
    expect(src).toContain('focusable')
  })
})

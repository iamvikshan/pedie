import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const headerSource = readFileSync(
  resolve('src/components/layout/header.tsx'),
  'utf-8'
)

describe('Header', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/header')
    expect(mod.Header).toBeDefined()
    expect(typeof mod.Header).toBe('function')
  })

  test('config uses Pedie branding', async () => {
    const { SITE_NAME } = await import('@/config')
    expect(SITE_NAME).toBe('Pedie')
    expect(SITE_NAME).not.toContain('Tech')
  })

  test('CategoryNav module exports the component', async () => {
    const catMod = await import('@components/layout/categoryNav')
    expect(catMod.CategoryNav).toBeDefined()
    expect(typeof catMod.CategoryNav).toBe('function')
  })

  test('imports and uses useScrollDirection hook', () => {
    expect(headerSource).toContain(
      "import { useScrollDirection } from '@/hooks/useScrollDirection'"
    )
    expect(headerSource).toContain('useScrollDirection()')
  })

  test('applies glass-depth class for depth glassmorphism', () => {
    expect(headerSource).toContain('glass-depth')
  })

  test('applies translate-y transition for scroll behavior', () => {
    expect(headerSource).toContain('-translate-y-full')
    expect(headerSource).toContain('translate-y-0')
    expect(headerSource).toContain('transition-transform')
  })

  test('hides header when scrolling down', () => {
    expect(headerSource).toContain(
      "scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'"
    )
  })

  test('ThemeToggle is desktop-only (hidden below lg)', () => {
    expect(headerSource).toContain('hidden lg:block')
    expect(headerSource).toContain('<ThemeToggle />')
  })

  test('has sticky positioning with z-50', () => {
    expect(headerSource).toContain('sticky top-0 z-50')
  })

  test('renders cart link with accessible label', () => {
    expect(headerSource).toContain("aria-label='Cart'")
    expect(headerSource).toContain('TbShoppingCart')
  })

  test('renders MobileNav with categories prop', () => {
    expect(headerSource).toContain('<MobileNav categories={categories}')
  })

  test('renders Deals link with TbFlame icon in Row 2', () => {
    expect(headerSource).toContain('TbFlame')
    expect(headerSource).toContain('/deals')
    expect(headerSource).toContain('Deals')
  })

  test('accepts categories and categoryTree props', () => {
    expect(headerSource).toContain('categories?: Category[]')
    expect(headerSource).toContain('categoryTree?: CategoryWithChildren[]')
  })

  test('uses lg: breakpoint for desktop/mobile toggle (not md:)', () => {
    // Row 2 uses lg:block
    expect(headerSource).toContain('lg:block')
    // Desktop search uses lg:flex
    expect(headerSource).toContain('lg:flex')
    // Mobile search uses lg:hidden
    expect(headerSource).toContain('lg:hidden')
    // Should NOT use md: for visibility (md:px-6 for padding is fine)
    expect(headerSource).not.toContain('hidden md:block')
    expect(headerSource).not.toContain('md:flex')
  })

  test('Row 2 order: All Items (left), then Deals, then CategoryNav', () => {
    const row2Start = headerSource.indexOf('Row 2')
    const allItemsIdx = headerSource.indexOf('All Items', row2Start)
    const dealsIdx = headerSource.indexOf('/deals', row2Start)
    const categoryNavIdx = headerSource.indexOf('CategoryNav', row2Start)
    expect(allItemsIdx).toBeLessThan(dealsIdx)
    expect(dealsIdx).toBeLessThan(categoryNavIdx)
  })

  test('Row 1 has icon+text stacked actions (flex-col items-center)', () => {
    expect(headerSource).toContain('flex-col items-center')
  })

  test('Row 1 icons use h-6 w-6 size', () => {
    // Row 1 icons (TbArrowsExchange, TbTool, TbShoppingCart, TbUser) should be 24px
    const row1 = headerSource.slice(
      headerSource.indexOf('Row 1'),
      headerSource.indexOf('Row 2')
    )
    expect(row1).toContain('h-6 w-6')
    expect(row1).not.toContain('h-5 w-5')
  })

  test('Row 2 uses h-12 for height', () => {
    const row2 = headerSource.slice(headerSource.indexOf('Row 2'))
    expect(row2).toContain('h-12')
    expect(row2).not.toContain('flex h-10 items-center')
  })

  test('Row 1 text labels hidden below lg breakpoint', () => {
    expect(headerSource).toContain('hidden lg:inline')
  })

  test('Row 1 has Trade In and Repairs icon+text actions', () => {
    expect(headerSource).toContain('TbArrowsExchange')
    expect(headerSource).toContain('/trade-in')
    expect(headerSource).toContain('Trade In')
    expect(headerSource).toContain('TbTool')
    expect(headerSource).toContain('/repairs')
    expect(headerSource).toContain('Repairs')
  })

  test('imports SidebarPanel instead of AllItemsPanel', () => {
    expect(headerSource).toContain('SidebarPanel')
    expect(headerSource).not.toContain('AllItemsPanel')
  })

  test('mobile shows expanded centered SearchBar', () => {
    expect(headerSource).toContain('<SearchBar defaultExpanded')
    // Mobile search is flex-1 lg:hidden
    expect(headerSource).toContain('flex-1 lg:hidden')
  })

  test('Repairs link moved from Row 2 to Row 1', () => {
    // Row 2 should NOT have Repairs
    const row2 = headerSource.slice(headerSource.indexOf('Row 2'))
    expect(row2).not.toContain('/repairs')
    // Row 1 should have Repairs
    const row1 = headerSource.slice(
      headerSource.indexOf('Row 1'),
      headerSource.indexOf('Row 2')
    )
    expect(row1).toContain('/repairs')
  })
})

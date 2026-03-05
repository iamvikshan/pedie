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

  test('ThemeToggle is desktop-only (hidden on mobile)', () => {
    // ThemeToggle should be wrapped in a div with hidden md:block
    expect(headerSource).toContain('hidden md:block')
    expect(headerSource).toContain('<ThemeToggle />')
  })

  test('has sticky positioning with z-50', () => {
    expect(headerSource).toContain('sticky top-0 z-50')
  })

  test('includes mobile SearchBar in right icons area', () => {
    // Should have md:hidden wrapper for mobile search
    expect(headerSource).toContain("className='md:hidden'")
    expect(headerSource).toContain('<SearchBar />')
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

  test('renders Repairs link with TbTool icon in Row 2', () => {
    expect(headerSource).toContain('TbTool')
    expect(headerSource).toContain('/repairs')
    expect(headerSource).toContain('Repairs')
  })

  test('accepts categories and categoryTree props', () => {
    expect(headerSource).toContain('categories?: Category[]')
    expect(headerSource).toContain('categoryTree?: CategoryWithChildren[]')
  })

  test('sign-in link is visible on all breakpoints (not hidden on mobile)', () => {
    // The TbUser sign-in link should use 'flex' (not 'hidden md:flex')
    // so it shows on mobile when user is not authenticated
    expect(headerSource).not.toContain('hidden md:flex items-center gap-2')
    expect(headerSource).toContain(
      'flex items-center gap-2 rounded-lg p-2 text-sm'
    )
  })
})

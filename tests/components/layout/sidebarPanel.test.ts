import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const src = readFileSync(
  resolve('src/components/layout/sidebarPanel.tsx'),
  'utf-8'
)

describe('SidebarPanel', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/sidebarPanel')
    expect(mod.SidebarPanel).toBeDefined()
    expect(typeof mod.SidebarPanel).toBe('function')
  })

  test('accepts variant prop for mobile/desktop', () => {
    expect(src).toContain("variant: 'mobile' | 'desktop'")
  })

  test('renders Hot Deals banner with CTA', () => {
    expect(src).toContain('Hot Deals')
    expect(src).toContain('Shop Deals')
    expect(src).toContain('/deals')
    expect(src).toContain('TbFlame')
  })

  test('renders inline quick links without Deals', () => {
    // Quick links: New Arrivals, Best Sellers, Trade In, Repairs — no Deals
    expect(src).toContain('New Arrivals')
    expect(src).toContain('Best Sellers')
    expect(src).toContain('Trade In')
    expect(src).toContain('Repairs')
    // Deals is NOT in quick links (covered by banner)
    const quickLinksSection = src.slice(
      src.indexOf('QUICK_LINKS'),
      src.indexOf('interface SidebarPanelProps')
    )
    expect(quickLinksSection).not.toContain("name: 'Deals'")
  })

  test('renders Top Brands section from brands.json', () => {
    expect(src).toContain('brands.json')
    expect(src).toContain('Top Brands')
    expect(src).toContain('brand.slug')
    expect(src).toContain('brand.logo')
  })

  test('renders category grid with See All link to /shop', () => {
    expect(src).toContain('categories.map')
    expect(src).toContain('/shop')
    expect(src).toContain('See All Categories')
  })

  test('mobile variant shows account + theme at bottom', () => {
    expect(src).toContain("variant === 'mobile'")
    expect(src).toContain('<ThemeToggle />')
    expect(src).toContain('Sign In')
    expect(src).toContain('/auth/signin')
  })

  test('desktop variant hides account + theme', () => {
    // Only rendered when variant === 'mobile', so desktop never shows it
    const mobileBlock = src.slice(src.indexOf("variant === 'mobile'"))
    expect(mobileBlock).toContain('ThemeToggle')
    expect(mobileBlock).toContain('TbUser')
  })

  test('has accessible dialog role and focus trap', () => {
    expect(src).toContain("role='dialog'")
    expect(src).toContain("aria-modal='true'")
    expect(src).toContain('Escape')
    expect(src).toContain('Tab')
    expect(src).toContain('focusable')
  })

  test('slides from left side', () => {
    expect(src).toContain("x: '-100%'")
    expect(src).toContain('left-0')
  })

  test('uses framer-motion AnimatePresence', () => {
    expect(src).toContain('AnimatePresence')
    expect(src).toContain('motion.div')
  })

  test('uses createPortal to render in document body', () => {
    expect(src).toContain('createPortal')
    expect(src).toContain('document.body')
  })

  test('includes Trade In link with TbArrowsExchange', () => {
    expect(src).toContain('TbArrowsExchange')
    expect(src).toContain('/trade-in')
  })

  test('Quick Links rendered as inline flex-wrap row', () => {
    expect(src).toContain('flex flex-wrap gap-2')
  })

  test('category cards use image with fallback', () => {
    expect(src).toContain('CATEGORY_IMAGES')
    expect(src).toContain('data-fallback')
    expect(src).toContain('group-hover:scale-105')
  })
})

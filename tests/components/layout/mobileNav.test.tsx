import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const mobileNavSource = readFileSync(
  resolve('src/components/layout/mobileNav.tsx'),
  'utf-8'
)
const src = mobileNavSource

describe('MobileNav', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/mobileNav')
    expect(mod.MobileNav).toBeDefined()
    expect(typeof mod.MobileNav).toBe('function')
  })

  test('is a thin wrapper delegating to SidebarPanel', () => {
    expect(src).toContain('SidebarPanel')
    expect(src).toContain("import { SidebarPanel } from './sidebarPanel'")
  })

  test('passes mobile variant to SidebarPanel', () => {
    expect(src).toContain("variant='mobile'")
  })

  test('contains hamburger button with accessible label', () => {
    expect(src).toContain("aria-label='Open menu'")
    expect(src).toContain('TbMenu2')
  })

  test('hides on lg+ breakpoint (not md)', () => {
    expect(src).toContain("className='lg:hidden'")
    expect(src).not.toContain("className='md:hidden'")
  })

  test('accepts categories prop of type Category[]', () => {
    expect(src).toContain('categories: Category[]')
    expect(src).toContain('import type { Category }')
  })

  test('passes categories and onClose to SidebarPanel', () => {
    expect(src).toContain('categories={categories}')
    expect(src).toContain('onClose={close}')
  })

  test('manages open/close state', () => {
    expect(src).toContain('useState(false)')
    expect(src).toContain('setIsOpen(true)')
    expect(src).toContain('setIsOpen(false)')
  })

  test('does not contain drawer content directly (delegated to SidebarPanel)', () => {
    // Thin wrapper should NOT contain drawer internals
    expect(src).not.toContain('AnimatePresence')
    expect(src).not.toContain('motion.div')
    expect(src).not.toContain('CATEGORY_IMAGES')
    expect(src).not.toContain('QUICK_LINKS')
    expect(src).not.toContain('ThemeToggle')
    expect(src).not.toContain('SearchBar')
  })
})

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

  test('does NOT contain Create Account link', () => {
    expect(mobileNavSource).not.toContain('Create Account')
  })

  test('contains Sign In link for unauthenticated users', () => {
    expect(mobileNavSource).toContain('Sign In')
    expect(mobileNavSource).toContain('/auth/signin')
  })

  test('contains ThemeToggle at the bottom of drawer', () => {
    expect(mobileNavSource).toContain('<ThemeToggle />')
    expect(mobileNavSource).toContain('Theme')
  })

  test('has accessible dialog role and aria-modal', () => {
    expect(mobileNavSource).toContain("role='dialog'")
    expect(mobileNavSource).toContain("aria-modal='true'")
  })

  test('contains hamburger button with accessible label', () => {
    expect(mobileNavSource).toContain("aria-label='Open menu'")
    expect(mobileNavSource).toContain('TbMenu2')
  })

  test('contains close button with accessible label', () => {
    expect(mobileNavSource).toContain("aria-label='Close menu'")
    expect(mobileNavSource).toContain('TbX')
  })

  test('renders category grid from categories prop', () => {
    expect(mobileNavSource).toContain('categories.map')
    expect(mobileNavSource).toContain('/collections/${cat.slug}')
  })

  test('accepts categories prop of type Category[]', () => {
    expect(mobileNavSource).toContain('categories: Category[]')
    expect(mobileNavSource).toContain('import type { Category }')
  })

  test('uses framer-motion AnimatePresence for drawer animation', () => {
    expect(mobileNavSource).toContain('AnimatePresence')
    expect(mobileNavSource).toContain('motion.div')
  })

  test('traps focus within the drawer', () => {
    expect(mobileNavSource).toContain('Tab')
    expect(mobileNavSource).toContain('Escape')
    expect(mobileNavSource).toContain('focusable')
  })

  test('hides on md+ breakpoint', () => {
    expect(mobileNavSource).toContain("className='md:hidden'")
  })

  test('renders SearchBar inside the drawer', () => {
    expect(mobileNavSource).toContain('SearchBar')
  })

  test('passes defaultExpanded to SearchBar', () => {
    expect(mobileNavSource).toContain('<SearchBar defaultExpanded')
  })

  test('uses card-style categories with images', () => {
    expect(mobileNavSource).toContain('CATEGORY_IMAGES')
    expect(mobileNavSource).toContain("import Image from 'next/image'")
    expect(mobileNavSource).toContain('group-hover:scale-105')
  })

  test('has quick links section with Repairs', () => {
    expect(mobileNavSource).toContain('QUICK_LINKS')
    expect(mobileNavSource).toContain('Quick Links')
    expect(mobileNavSource).toContain('/deals')
    expect(mobileNavSource).toContain('/repairs')
    expect(mobileNavSource).toContain('New Arrivals')
    expect(mobileNavSource).toContain('Best Sellers')
  })

  test('quick links use Tabler icons', () => {
    expect(mobileNavSource).toContain('TbFlame')
    expect(mobileNavSource).toContain('TbTool')
    expect(mobileNavSource).toContain('TbSparkles')
    expect(mobileNavSource).toContain('TbTrendingUp')
  })

  test('sign-out handler destructures error from signOut result', () => {
    expect(src).toContain('const { error } = await supabase.auth.signOut()')
  })

  test('sign-out handler checks error before navigating', () => {
    // The error check must come BEFORE router.push
    const errorCheckIdx = src.indexOf('if (error)')
    const routerPushIdx = src.indexOf("router.push('/')")
    expect(errorCheckIdx).toBeGreaterThan(-1)
    expect(routerPushIdx).toBeGreaterThan(-1)
    expect(errorCheckIdx).toBeLessThan(routerPushIdx)
  })

  test('sign-out handler returns early on error without navigating', () => {
    // After error check, there should be a return before close/push/refresh
    const signOutBlock = src.slice(
      src.indexOf('const { error } = await supabase.auth.signOut()'),
      src.indexOf("router.push('/')")
    )
    expect(signOutBlock).toContain('return')
  })
})

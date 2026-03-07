import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dir, '..')
const GLOBALS_CSS = join(ROOT, 'src/app/globals.css')
const COMPONENTS_DIR = join(ROOT, 'src/components')

function walkFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...walkFiles(full))
    } else {
      results.push(full)
    }
  }
  return results
}

function componentFiles(): string[] {
  return walkFiles(COMPONENTS_DIR).filter(f => /\.(tsx?|jsx?)$/.test(f))
}

function readComponent(relativePath: string): string {
  return readFileSync(join(COMPONENTS_DIR, relativePath), 'utf-8')
}

describe('Design System Tokens', () => {
  const css = readFileSync(GLOBALS_CSS, 'utf-8')

  // Split CSS into @theme (light) and .dark sections for structural validation
  const darkBlockStart = css.indexOf('.dark {')
  const themeBlock = css.slice(0, darkBlockStart)
  const darkBlock = css.slice(darkBlockStart)

  const requiredTokens = [
    '--color-pedie-success',
    '--color-pedie-success-bg',
    '--color-pedie-error',
    '--color-pedie-error-bg',
    '--color-pedie-warning',
    '--color-pedie-warning-bg',
    '--color-pedie-info',
    '--color-pedie-info-bg',
    '--color-pedie-sunken',
  ]

  test.each(requiredTokens)(
    'globals.css @theme block contains semantic token %s',
    token => {
      expect(themeBlock).toContain(token)
    }
  )

  test.each(requiredTokens)(
    'globals.css .dark block contains semantic token %s',
    token => {
      expect(darkBlock).toContain(token)
    }
  )

  test('no component uses the banned pedie-primary token', () => {
    const violations: string[] = []
    for (const file of componentFiles()) {
      const content = readFileSync(file, 'utf-8')
      if (content.includes('pedie-primary')) {
        violations.push(file.replace(ROOT + '/', ''))
      }
    }
    expect(violations).toEqual([])
  })

  test('no component uses bare pedie-muted token (should be pedie-text-muted)', () => {
    // Match pedie-muted that is NOT part of pedie-text-muted
    const barePattern = /pedie-(?!text-)muted/g
    const violations: string[] = []
    for (const file of componentFiles()) {
      const content = readFileSync(file, 'utf-8')
      if (barePattern.test(content)) {
        violations.push(file.replace(ROOT + '/', ''))
        barePattern.lastIndex = 0
      }
    }
    expect(violations).toEqual([])
  })
})

describe('Phase 3: Dead Code Elimination', () => {
  test('footerNewsletterForm is not imported anywhere', () => {
    const allFiles = walkFiles(join(ROOT, 'src')).filter(f =>
      /\.(tsx?|jsx?)$/.test(f)
    )
    const violations: string[] = []
    for (const file of allFiles) {
      const content = readFileSync(file, 'utf-8')
      if (
        content.includes('footerNewsletterForm') ||
        content.includes('FooterNewsletterForm')
      ) {
        violations.push(file.replace(ROOT + '/', ''))
      }
    }
    expect(violations).toEqual([])
  })

  test('no component file contains inline Google SVG (except googleIcon.tsx)', () => {
    // Build the search string dynamically to avoid the test itself matching grep checks
    const googleSvgSnippet = ['M22', '.56 12', '.25'].join('')
    const violations: string[] = []
    for (const file of componentFiles()) {
      if (file.endsWith('googleIcon.tsx')) continue
      const content = readFileSync(file, 'utf-8')
      if (content.includes(googleSvgSnippet)) {
        violations.push(file.replace(ROOT + '/', ''))
      }
    }
    expect(violations).toEqual([])
  })
})

describe('Phase 4: Primitive Adoption', () => {
  // Unicode emoji ranges for detection
  const emojiPattern =
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/u

  test('no emoji icons in admin sidebar', () => {
    const sidebarPath = join(COMPONENTS_DIR, 'admin/sidebar.tsx')
    const content = readFileSync(sidebarPath, 'utf-8')
    const lines = content.split('\n')
    const violations: string[] = []
    for (const line of lines) {
      if (emojiPattern.test(line)) {
        violations.push(line.trim())
      }
    }
    expect(violations).toEqual([])
  })

  test('no emoji icons in admin kpiCards', () => {
    const kpiPath = join(COMPONENTS_DIR, 'admin/kpiCards.tsx')
    const content = readFileSync(kpiPath, 'utf-8')
    const lines = content.split('\n')
    const violations: string[] = []
    for (const line of lines) {
      if (emojiPattern.test(line)) {
        violations.push(line.trim())
      }
    }
    expect(violations).toEqual([])
  })

  test('no hardcoded Tailwind colors in storefront components', () => {
    const rawColorPattern =
      /(?:bg|text|border)-(?:green|red|blue|gray|yellow|orange|purple|pink|indigo|emerald|teal|cyan|amber|lime|violet|fuchsia|rose|slate|zinc|neutral|stone)-\d{2,3}/g
    const violations: string[] = []
    for (const file of componentFiles()) {
      // Exclude ui/ and admin/ directories
      const rel = file.replace(COMPONENTS_DIR + '/', '')
      if (rel.startsWith('ui/') || rel.startsWith('admin/')) continue
      const content = readFileSync(file, 'utf-8')
      const matches = content.match(rawColorPattern)
      if (matches) {
        violations.push(
          `${file.replace(ROOT + '/', '')}: ${matches.join(', ')}`
        )
      }
    }
    expect(violations).toEqual([])
  })

  test('targeted form components adopt Input, Alert, Select, and Spinner primitives', () => {
    expect(readComponent('auth/signinForm.tsx')).toContain(
      '@components/ui/input'
    )
    expect(readComponent('auth/signinForm.tsx')).toContain(
      '@components/ui/alert'
    )

    expect(readComponent('auth/signupForm.tsx')).toContain(
      '@components/ui/input'
    )
    expect(readComponent('auth/signupForm.tsx')).toContain(
      '@components/ui/alert'
    )

    expect(readComponent('checkout/shippingForm.tsx')).toContain(
      '@components/ui/input'
    )

    expect(readComponent('checkout/mpesaPayment.tsx')).toContain(
      '@components/ui/input'
    )
    expect(readComponent('checkout/mpesaPayment.tsx')).toContain(
      '@components/ui/alert'
    )
    expect(readComponent('checkout/mpesaPayment.tsx')).toContain(
      '@components/ui/spinner'
    )

    expect(readComponent('home/newsletterSignup.tsx')).toContain(
      '@components/ui/input'
    )

    expect(readComponent('account/profileForm.tsx')).toContain(
      '@components/ui/input'
    )
    expect(readComponent('account/profileForm.tsx')).toContain(
      '@components/ui/alert'
    )

    expect(readComponent('catalog/sortDropdown.tsx')).toContain(
      '@components/ui/select'
    )
  })

  test('targeted badge components adopt the Badge primitive', () => {
    expect(readComponent('ui/productCard.tsx')).toContain(
      '@components/ui/badge'
    )
    expect(readComponent('catalog/activeFilters.tsx')).toContain(
      '@components/ui/badge'
    )
    expect(readComponent('listing/priceDisplay.tsx')).toContain(
      '@components/ui/badge'
    )
  })

  test('no source files use bg-pedie-dark', () => {
    const allAppFiles = walkFiles(join(ROOT, 'src/app')).filter(f =>
      /\.(tsx?|jsx?)$/.test(f)
    )
    const filesToCheck = [...componentFiles(), ...allAppFiles]
    // deduplicate
    const unique = [...new Set(filesToCheck)]

    const violations = unique.filter(file =>
      readFileSync(file, 'utf-8').includes('bg-pedie-dark')
    )

    expect(violations.map(f => f.replace(ROOT + '/', ''))).toEqual([])
  })

  test('targeted inline SVG icon files use react-icons/tb instead', () => {
    const files = [
      'catalog/activeFilters.tsx',
      'catalog/filterSidebar.tsx',
      'catalog/sortDropdown.tsx',
      'listing/productDescription.tsx',
      'cart/cartItem.tsx',
      'listing/shippingInfo.tsx',
    ]

    const violations = files.filter(file =>
      readComponent(file).includes('<svg')
    )

    expect(violations).toEqual([])
  })

  test('glass overlays use the shared glass utility in mega menu and user menu', () => {
    const megaMenu = readComponent('layout/megaMenu.tsx')
    const userMenu = readComponent('auth/userMenu.tsx')

    expect(megaMenu).toContain('glass')
    expect(userMenu).toContain('glass')
    expect(megaMenu).not.toContain('bg-pedie-glass')
    expect(megaMenu).not.toContain('backdrop-blur-xl')
    expect(userMenu).not.toContain('bg-pedie-glass')
    expect(userMenu).not.toContain('backdrop-blur-xl')
  })
})

describe('Phase 5: Animations & Accessibility', () => {
  test('no raw whileInView inline configs in component files', () => {
    // Components should use shared variant refs (whileInView="visible")
    // not inline objects (whileInView={{ ... }})
    const inlinePattern = /whileInView=\{\{/
    const violations: string[] = []
    for (const file of componentFiles()) {
      const content = readFileSync(file, 'utf-8')
      if (inlinePattern.test(content)) {
        violations.push(file.replace(ROOT + '/', ''))
      }
    }
    expect(violations).toEqual([])
  })

  test('SVGs have aria-hidden', () => {
    // Files with inline <svg elements should also include aria-hidden
    // Exclude googleIcon.tsx (already has it) and ui/ primitives that
    // wrap SVGs in role="status" containers
    const violations: string[] = []
    for (const file of componentFiles()) {
      const rel = file.replace(COMPONENTS_DIR + '/', '')
      // Skip known good patterns
      if (rel === 'ui/googleIcon.tsx') continue
      if (rel === 'ui/spinner.tsx') continue
      const content = readFileSync(file, 'utf-8')
      if (content.includes('<svg') && !content.includes('aria-hidden')) {
        violations.push(rel)
      }
    }
    expect(violations).toEqual([])
  })

  test('targeted components import from @lib/motion instead of inline variants', () => {
    const files = [
      'home/trustBadges.tsx',
      'home/sustainabilitySection.tsx',
      'home/customerFavorites.tsx',
      'home/categoryShowcaseWrapper.tsx',
    ]
    for (const file of files) {
      expect(readComponent(file)).toContain('@lib/motion')
    }
  })

  test('sidebarPanel uses springTransition from shared motion library', () => {
    const content = readComponent('layout/sidebarPanel.tsx')
    expect(content).toContain('@lib/motion')
    expect(content).toContain('springTransition')
  })

  test('userMenu dropdown has role="menu" and items have role="menuitem"', () => {
    const content = readComponent('auth/userMenu.tsx')
    expect(content).toContain("role='menu'")
    expect(content).toContain("role='menuitem'")
  })

  test('filterSidebar mobile toggle has aria-expanded', () => {
    const content = readComponent('catalog/filterSidebar.tsx')
    expect(content).toContain('aria-expanded')
  })

  test('targeted admin forms adopt Button primitive for submit', () => {
    const files = [
      'admin/orderStatusUpdater.tsx',
      'admin/categoryForm.tsx',
      'admin/productForm.tsx',
      'admin/listingForm.tsx',
    ]
    for (const file of files) {
      const content = readComponent(file)
      expect(content).toContain('@components/ui/button')
    }
  })

  test('signinForm Google button uses Button component', () => {
    const content = readComponent('auth/signinForm.tsx')
    // Should not have a raw <button for Google sign-in
    // The component already imports Button; check no raw <button elements remain
    const rawButtons = (content.match(/<button[\s\n]/g) || []).length
    expect(rawButtons).toBe(0)
  })

  test('signupForm Google button uses Button component', () => {
    const content = readComponent('auth/signupForm.tsx')
    const rawButtons = (content.match(/<button[\s\n]/g) || []).length
    expect(rawButtons).toBe(0)
  })
})

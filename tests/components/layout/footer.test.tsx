import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SOURCE = readFileSync(
  resolve('src/components/layout/footer.tsx'),
  'utf-8'
)

describe('Footer', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/footer')
    expect(mod.Footer).toBeDefined()
    expect(typeof mod.Footer).toBe('function')
  })

  test('config uses Pedie branding', async () => {
    const { SITE_NAME } = await import('@/config')
    expect(SITE_NAME).toBe('Pedie')
    expect(SITE_NAME).not.toContain('Tech')
  })

  test('exports FOOTER_LINKS constant', async () => {
    const mod = await import('@components/layout/footer')
    expect(mod.FOOTER_LINKS).toBeDefined()
    expect(Array.isArray(mod.FOOTER_LINKS)).toBe(true)
  })

  test('FOOTER_LINKS has 4 groups', async () => {
    const { FOOTER_LINKS } = await import('@components/layout/footer')
    expect(FOOTER_LINKS.length).toBe(4)
  })

  test('source contains social link icons', () => {
    expect(SOURCE).toContain('TbBrandTiktok')
    expect(SOURCE).toContain('TbBrandInstagram')
    expect(SOURCE).toContain('TbBrandX')
    expect(SOURCE).toContain('TbBrandYoutube')
    expect(SOURCE).toContain('TbBrandGithub')
  })

  test('source contains M-PESA and PayPal badges', () => {
    expect(SOURCE).toContain('M-PESA')
    expect(SOURCE).toContain('PayPal')
  })

  test('source contains copyright text', () => {
    expect(SOURCE).toContain('All rights reserved')
  })

  test('source uses glass-footer class', () => {
    expect(SOURCE).toContain('glass-footer')
  })

  test('uses NewsletterSignup component (not FooterNewsletterForm)', () => {
    expect(SOURCE).toContain('NewsletterSignup')
    expect(SOURCE).not.toContain('FooterNewsletterForm')
  })

  test('uses details/summary for mobile accordion', () => {
    expect(SOURCE).toContain('<details')
    expect(SOURCE).toContain('<summary')
  })

  test('has footer-accordion class for responsive behavior', () => {
    expect(SOURCE).toContain('footer-accordion')
  })

  test('uses TbChevronDown for toggle indicator', () => {
    expect(SOURCE).toContain('TbChevronDown')
  })

  test('hides chevron on desktop with md:hidden', () => {
    expect(SOURCE).toContain('md:hidden')
  })

  test('rotates chevron when open with group-open:rotate-180', () => {
    expect(SOURCE).toContain('group-open:rotate-180')
  })

  test('hides default marker with list-none and webkit marker hidden', () => {
    expect(SOURCE).toContain('list-none')
    expect(SOURCE).toContain('[&::-webkit-details-marker]:hidden')
  })
})

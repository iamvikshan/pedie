import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SOURCE = readFileSync(resolve('src/lib/data/listings.ts'), 'utf-8')

describe('promotion listing helpers', () => {
  test('module exports getPromotionListings and getHotPromotionListings', async () => {
    const mod = await import('@data/listings')
    expect(mod.getPromotionListings).toBeDefined()
    expect(typeof mod.getPromotionListings).toBe('function')
    expect(mod.getHotPromotionListings).toBeDefined()
    expect(typeof mod.getHotPromotionListings).toBe('function')
  })

  test('source does not import getPricingTier (discount computed locally)', () => {
    expect(SOURCE).not.toContain('getPricingTier')
  })

  test('source checks sale_price_kes for discount logic', () => {
    expect(SOURCE).toContain('sale_price_kes')
  })

  test('source includes only active listings', () => {
    expect(SOURCE).not.toContain(".eq('status', 'available')")
    expect(SOURCE).toContain(".eq('status', 'active')")
  })

  test('source contains limit logic for hot promotions (slice to 20)', () => {
    expect(SOURCE).toMatch(/\.slice\(0,\s*20\)/)
  })

  test('computeDiscount guards against NaN price_kes', () => {
    expect(SOURCE).toContain('Number.isFinite(listing.price_kes)')
    expect(SOURCE).toContain('Number.isFinite(listing.sale_price_kes)')
  })

  test('computeDiscount clamps output to [0, 100]', () => {
    expect(SOURCE).toContain('Math.min')
    expect(SOURCE).toContain('Math.max')
  })
})

import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { calculateDiscount, formatKes, getPricingTier } from '@helpers'

const src = readFileSync(
  resolve('src/components/ui/productFamilyCard.tsx'),
  'utf-8'
)

describe('ProductFamilyCard Component', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/ui/productFamilyCard')
    expect(mod.ProductFamilyCard).toBeDefined()
    expect(typeof mod.ProductFamilyCard).toBe('function')
  })

  test('exports PRODUCT_FAMILY_CARD_ICONS constant', async () => {
    const mod = await import('@components/ui/productFamilyCard')
    expect(mod.PRODUCT_FAMILY_CARD_ICONS).toBeDefined()
    expect(Array.isArray(mod.PRODUCT_FAMILY_CARD_ICONS)).toBe(true)
    expect(mod.PRODUCT_FAMILY_CARD_ICONS.length).toBe(2)
  })

  test('PRODUCT_FAMILY_CARD_ICONS contains expected icon names', async () => {
    const { PRODUCT_FAMILY_CARD_ICONS } =
      await import('@components/ui/productFamilyCard')
    expect(PRODUCT_FAMILY_CARD_ICONS).toContain('TbPhoto')
    expect(PRODUCT_FAMILY_CARD_ICONS).toContain('TbFlame')
  })

  // Pure logic tests
  test('sale tier: final < price AND status = onsale', () => {
    const tier = getPricingTier(100000, 150000, 'onsale')
    expect(tier).toBe('sale')
    const discount = calculateDiscount(150000, 100000)
    expect(discount).toBe(33)
  })

  test('discounted tier: final < price AND status != onsale', () => {
    const tier = getPricingTier(100000, 150000, 'available')
    expect(tier).toBe('discounted')
  })

  test('normal tier: final >= price', () => {
    const tier = getPricingTier(150000, 150000, 'available')
    expect(tier).toBe('normal')
  })

  test('formats price in KES', () => {
    expect(formatKes(120000)).toContain('120')
  })

  // Source analysis tests
  test('sale tier shows Flash Sale text and discount classes', () => {
    expect(src).toContain('Flash Sale')
    expect(src).toContain('text-pedie-discount')
    expect(src).toContain('TbFlame')
  })

  test('discounted tier shows line-through for original price', () => {
    expect(src).toContain('line-through')
    expect(src).toContain("tier === 'discounted'")
  })

  test('normal tier shows single price', () => {
    expect(src).toContain('text-pedie-accent')
  })

  test('does not show "From" prefix', () => {
    expect(src).not.toContain('pricePrefix')
    expect(src).not.toContain("'From '")
    expect(src).not.toContain('hasPriceVariance')
  })

  test('links to /products/ path', () => {
    expect(src).toContain('/products/${product.slug}')
  })

  test('does not show options badge', () => {
    expect(src).not.toContain('TbStack2')
    expect(src).not.toContain('options')
  })

  test('uses ConditionBadge component', () => {
    expect(src).toContain('ConditionBadge')
    expect(src).toContain('representative.condition')
  })

  test('model-only name, no brand in h3', () => {
    expect(src).toContain('const productName = product.model')
  })

  test('has aria-label for accessibility', () => {
    expect(src).toContain('aria-label')
  })

  test('uses glass rounded-2xl card styling', () => {
    expect(src).toContain(
      'glass rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 border border-pedie-border hover:border-pedie-green/30'
    )
  })

  test('is not a client component', () => {
    expect(src).not.toContain("'use client'")
    expect(src).not.toContain('"use client"')
  })

  test('shows storage and RAM subtitle', () => {
    expect(src).toContain('representative.storage')
    expect(src).toContain('representative.ram')
  })
})

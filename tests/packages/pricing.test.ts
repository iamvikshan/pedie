import { describe, expect, test } from 'bun:test'
import {
  calculateDeposit,
  calculateDiscount,
  formatKes,
  getPricingTier,
  usdToKes,
} from '@helpers/pricing'
import { DEPOSIT_THRESHOLD_KES, KES_USD_RATE } from '@/config'

describe('usdToKes', () => {
  test('converts USD to KES at rate 130', () => {
    expect(usdToKes(100)).toBe(100 * KES_USD_RATE)
  })

  test('rounds to nearest integer', () => {
    expect(usdToKes(10.5)).toBe(Math.round(10.5 * KES_USD_RATE))
  })

  test('handles zero', () => {
    expect(usdToKes(0)).toBe(0)
  })
})

describe('calculateDeposit', () => {
  test('returns 5% for items under KES 70,000', () => {
    expect(calculateDeposit(50_000)).toBe(2500)
  })

  test('returns 10% for items at KES 70,000', () => {
    expect(calculateDeposit(DEPOSIT_THRESHOLD_KES)).toBe(7000)
  })

  test('returns 10% for items above KES 70,000', () => {
    expect(calculateDeposit(100_000)).toBe(10_000)
  })

  test('handles small amounts', () => {
    expect(calculateDeposit(1000)).toBe(50)
  })
})

describe('formatKes', () => {
  test('formats amount with KES prefix', () => {
    const result = formatKes(50000)
    expect(result).toStartWith('KES ')
    expect(result).toContain('50')
  })

  test('formats zero', () => {
    expect(formatKes(0)).toBe('KES 0')
  })
})

describe('calculateDiscount', () => {
  test('calculates percentage correctly', () => {
    expect(calculateDiscount(100, 80)).toBe(20)
  })

  test('returns 0 when original is 0', () => {
    expect(calculateDiscount(0, 50)).toBe(0)
  })

  test('returns 0 when original is negative', () => {
    expect(calculateDiscount(-10, 50)).toBe(0)
  })

  test('handles same price (no discount)', () => {
    expect(calculateDiscount(100, 100)).toBe(0)
  })

  test('rounds to nearest integer', () => {
    expect(calculateDiscount(300, 200)).toBe(33)
  })
})

describe('getPricingTier', () => {
  test("returns 'sale' when sale_price_kes is set and lower than price_kes", () => {
    expect(getPricingTier({ price_kes: 150000, sale_price_kes: 100000 })).toBe(
      'sale'
    )
  })

  test("returns 'regular' when no sale and price < 100000", () => {
    expect(getPricingTier({ price_kes: 50000 })).toBe('regular')
  })

  test("returns 'premium' when no sale and price >= 100000", () => {
    expect(getPricingTier({ price_kes: 150000 })).toBe('premium')
  })

  test("returns 'regular' when sale_price_kes is null", () => {
    expect(getPricingTier({ price_kes: 50000, sale_price_kes: null })).toBe(
      'regular'
    )
  })

  test("returns 'premium' when sale_price_kes equals price_kes (not a discount)", () => {
    expect(getPricingTier({ price_kes: 150000, sale_price_kes: 150000 })).toBe(
      'premium'
    )
  })

  test("returns 'sale' for small discount with sale_price_kes", () => {
    expect(getPricingTier({ price_kes: 150000, sale_price_kes: 149000 })).toBe(
      'sale'
    )
  })

  test("returns 'regular' when sale_price_kes exceeds price_kes", () => {
    expect(getPricingTier({ price_kes: 50000, sale_price_kes: 60000 })).toBe(
      'regular'
    )
  })
})

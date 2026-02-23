import { describe, expect, test } from 'bun:test'
import {
  usdToKes,
  calculateDeposit,
  generateListingId,
  formatKes,
  calculateDiscount,
  KES_USD_RATE,
  DEPOSIT_THRESHOLD_KES,
} from '@lib/constants'

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

describe('generateListingId', () => {
  test('returns string matching PD-XXXXX pattern', () => {
    const id = generateListingId()
    expect(id).toMatch(/^PD-[0-9A-Z]{5}$/)
  })

  test('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateListingId()))
    // With 36^5 possible combinations, 100 should all be unique
    expect(ids.size).toBe(100)
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

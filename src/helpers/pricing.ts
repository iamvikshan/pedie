/**
 * Pricing and currency helper functions.
 * Import from '@helpers' (barrel) or '@helpers/pricing'.
 */

import {
  KES_USD_RATE,
  DEPOSIT_THRESHOLD_KES,
  DEPOSIT_RATE_LOW,
  DEPOSIT_RATE_HIGH,
} from '@config'

export function usdToKes(usd: number): number {
  return Math.round(usd * KES_USD_RATE)
}

export function calculateDeposit(priceKes: number): number {
  const rate =
    priceKes >= DEPOSIT_THRESHOLD_KES ? DEPOSIT_RATE_HIGH : DEPOSIT_RATE_LOW
  return Math.round(priceKes * rate)
}

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`
}

export function calculateDiscount(original: number, current: number): number {
  if (original <= 0) return 0
  const discount = Math.round(((original - current) / original) * 100)
  return Math.max(0, Math.min(100, discount))
}

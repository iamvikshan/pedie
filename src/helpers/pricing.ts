/**
 * Pricing and currency helper functions.
 * Import from '@helpers' (barrel) or '@helpers/pricing'.
 */

import {
  DEPOSIT_RATE_HIGH,
  DEPOSIT_RATE_LOW,
  DEPOSIT_THRESHOLD_KES,
  KES_USD_RATE,
} from '@/config'

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

export type PricingTier = 'sale' | 'regular' | 'premium'

export function getPricingTier(listing: {
  price_kes: number
  sale_price_kes?: number | null
}): PricingTier {
  if (
    listing.sale_price_kes != null &&
    listing.sale_price_kes < listing.price_kes
  )
    return 'sale'
  if (listing.price_kes >= 100000) return 'premium'
  return 'regular'
}

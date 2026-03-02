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

/**
 * Pricing tier for display logic.
 * - 'sale': final_price_kes < price_kes AND is_on_sale — full sale treatment (pill, hot deals, priority)
 * - 'discounted': final_price_kes < price_kes but NOT on_sale — show discount inline, no pill
 * - 'normal': final_price_kes >= price_kes — show final price only
 */
export type PricingTier = 'sale' | 'discounted' | 'normal'

export function getPricingTier(
  finalPriceKes: number,
  priceKes: number,
  isOnSale: boolean
): PricingTier {
  if (finalPriceKes < priceKes && isOnSale) return 'sale'
  if (finalPriceKes < priceKes) return 'discounted'
  return 'normal'
}

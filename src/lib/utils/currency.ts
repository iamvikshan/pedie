/**
 * Currency conversion utilities (client-safe, no env access)
 * Uses the canonical rate from constants.ts as the single source of truth.
 */

import { KES_USD_RATE } from '@lib/constants'

/** Re-export the canonical rate for callers that need it */
export const DEFAULT_KES_PER_USD = KES_USD_RATE

/** Convert KES to USD string with 2 decimal places */
export function kesToUsd(
  kes: number,
  rate: number = DEFAULT_KES_PER_USD
): string {
  if (!Number.isFinite(kes) || !Number.isFinite(rate) || rate <= 0) {
    return '0.00'
  }
  return (kes / rate).toFixed(2)
}

/** Convert USD to KES */
export function usdToKes(
  usd: number,
  rate: number = DEFAULT_KES_PER_USD
): number {
  if (!Number.isFinite(usd) || !Number.isFinite(rate) || rate <= 0) {
    return 0
  }
  return Math.round(usd * rate)
}

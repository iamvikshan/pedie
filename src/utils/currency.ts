/**
 * Currency conversion utilities (client-safe, no env access).
 * Uses the canonical rate from @config as the single source of truth.
 *
 * Import from '@utils/currency'.
 */

import { KES_USD_RATE } from '@/config'

/** Convert KES to USD string with 2 decimal places */
export function kesToUsd(kes: number, rate: number = KES_USD_RATE): string {
  if (!Number.isFinite(kes) || !Number.isFinite(rate) || rate <= 0) {
    return '0.00'
  }
  return (kes / rate).toFixed(2)
}

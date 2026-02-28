/**
 * Currency conversion utilities (client-safe, no env access).
 * Uses the canonical rate from @config as the single source of truth.
 *
 * Import from '@utils/currency'.
 */

import { KES_USD_RATE } from '../config'

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

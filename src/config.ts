/**
 * Pedie business configuration — non-secret values.
 *
 * Import from '@/config'.
 * For actual secrets use environment variables (.env).
 */

// ── Exchange & pricing ────────────────────────────────────────────
export const KES_USD_RATE = 130
export const DEPOSIT_THRESHOLD_KES = 70_000
export const DEPOSIT_RATE_LOW = 0.05 // 5% for items < KES 70k
export const DEPOSIT_RATE_HIGH = 0.1 // 10% for items >= KES 70k

// ── Shipping ──────────────────────────────────────────────────────
export const SHIPPING_DAYS_MIN = 7
export const SHIPPING_DAYS_MAX = 14

// ── Listing IDs ───────────────────────────────────────────────────
export const LISTING_ID_PREFIX = 'PD'
export const DEFAULT_COLLECTION_HREF = '/collections'

// ── Google Sheets sync ────────────────────────────────────────────
export const SHEETS_TAB_NAME = 'inv'

// ── Site metadata (non-secret) ────────────────────────────────────
export const SITE_NAME = 'Pedie Tech'
export const SITE_DESCRIPTION =
  'Quality refurbished electronics in Kenya — phones, laptops & tablets with warranty.'
export const SITE_URL = 'https://pedie.tech'
export const SUPPORT_EMAIL = 'pedietech@gmail.com'

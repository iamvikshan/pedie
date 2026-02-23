export const KES_USD_RATE = 130
export const DEPOSIT_THRESHOLD_KES = 70_000
export const DEPOSIT_RATE_LOW = 0.05 // 5% for items < KES 70k
export const DEPOSIT_RATE_HIGH = 0.1 // 10% for items >= KES 70k
export const WARRANTY_MONTHS = 3
export const SHIPPING_DAYS_MIN = 7
export const SHIPPING_DAYS_MAX = 14
export const LISTING_ID_PREFIX = 'PD'

export function usdToKes(usd: number): number {
  return Math.round(usd * KES_USD_RATE)
}

export function calculateDeposit(priceKes: number): number {
  const rate =
    priceKes >= DEPOSIT_THRESHOLD_KES ? DEPOSIT_RATE_HIGH : DEPOSIT_RATE_LOW
  return Math.round(priceKes * rate)
}

export function generateListingId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let id = ''
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${LISTING_ID_PREFIX}-${id}`
}

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`
}

export function calculateDiscount(original: number, current: number): number {
  if (original <= 0) return 0
  return Math.round(((original - current) / original) * 100)
}

import type { Listing } from '@app-types/product'

/**
 * Listing type priority — lower number = higher priority.
 * `standard` ALWAYS wins regardless of price.
 *
 * Import from '@utils/products'.
 */
export const LISTING_TYPE_PRIORITY: Record<string, number> = {
  standard: 1,
  preorder: 2,
  affiliate: 3,
  referral: 4,
}

/**
 * Select the representative listing for a product family.
 *
 * Algorithm:
 * 1. Filter out sold and reserved listings (not purchasable)
 * 2. Group by listing_type priority (standard > preorder > affiliate > referral)
 * 3. The entire highest-priority type tier wins regardless of price
 * 4. Within the winning tier, pick the listing with lowest final_price_kes
 */
export function selectRepresentative(listings: Listing[]): Listing | null {
  const available = listings.filter(
    l => l.status !== 'sold' && l.status !== 'reserved'
  )
  if (available.length === 0) return null

  // Find the best (lowest number) priority among available listings
  let bestPriority = Infinity
  for (const l of available) {
    const p = LISTING_TYPE_PRIORITY[l.listing_type] ?? 99
    if (p < bestPriority) bestPriority = p
  }

  // Filter to only listings in the winning tier
  const winningTier = available.filter(
    l => (LISTING_TYPE_PRIORITY[l.listing_type] ?? 99) === bestPriority
  )

  // Within winning tier, pick lowest effective price
  const effectivePrice = (l: Listing) => l.sale_price_kes ?? l.price_kes
  return winningTier.reduce((best, current) =>
    effectivePrice(current) < effectivePrice(best) ? current : best
  )
}

/**
 * Find a "better deal" — a non-standard listing with the same storage/color/condition
 * but cheaper price than the given listing.
 */
export function findBetterDeal(
  currentListing: Listing,
  allListings: Listing[]
): Listing | null {
  if (currentListing.listing_type !== 'standard') return null

  const effectivePrice = (l: Listing) => l.sale_price_kes ?? l.price_kes
  const currentPrice = effectivePrice(currentListing)

  const candidates = allListings.filter(
    l =>
      l.id !== currentListing.id &&
      l.listing_type !== 'standard' &&
      l.status !== 'sold' &&
      l.status !== 'reserved' &&
      l.storage === currentListing.storage &&
      l.color === currentListing.color &&
      l.condition === currentListing.condition &&
      effectivePrice(l) < currentPrice
  )

  if (candidates.length === 0) return null

  // Return the cheapest candidate
  return candidates.reduce((best, current) =>
    effectivePrice(current) < effectivePrice(best) ? current : best
  )
}

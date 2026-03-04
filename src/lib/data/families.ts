import type { Listing, Product, ProductFamily } from '@app-types/product'
import { createClient } from '@lib/supabase/server'

/**
 * Listing type priority — lower number = higher priority.
 * `standard` ALWAYS wins regardless of price.
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

  // Within winning tier, pick lowest final_price_kes
  return winningTier.reduce((best, current) =>
    current.final_price_kes < best.final_price_kes ? current : best
  )
}

/**
 * Get a product family by product slug.
 * Returns the product with all its available listings and the representative.
 */
export async function getProductFamilyBySlug(
  slug: string
): Promise<ProductFamily | null> {
  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .single()

  if (productError || !product) return null

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .eq('product_id', product.id)
    .not('status', 'in', '(sold,reserved)')
    .order('final_price_kes', { ascending: true })

  if (listingsError) return null

  const allListings = (listings ?? []) as unknown as Listing[]
  const representative = selectRepresentative(allListings)
  if (!representative) return null

  return {
    product: product as unknown as Product,
    listings: allListings,
    representative,
    variantCount: allListings.length,
  }
}

/**
 * Get all product families (for homepage, collection pages).
 * Each product is represented by its best listing.
 * Uses a single batch query for all listings to avoid N+1.
 */
export async function getProductFamilies(
  limit?: number
): Promise<ProductFamily[]> {
  const supabase = await createClient()

  // Batch: get all products and all non-sold listings in two queries
  const [productsResult, listingsResult] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('brand', { ascending: true }),
    supabase
      .from('listings')
      .select('*')
      .not('status', 'in', '(sold,reserved)')
      .order('final_price_kes', { ascending: true }),
  ])

  if (productsResult.error || !productsResult.data) return []
  if (listingsResult.error || !listingsResult.data) return []

  // Group listings by product_id
  const listingsByProduct = new Map<string, Listing[]>()
  for (const listing of listingsResult.data as unknown as Listing[]) {
    const existing = listingsByProduct.get(listing.product_id) ?? []
    existing.push(listing)
    listingsByProduct.set(listing.product_id, existing)
  }

  const families: ProductFamily[] = []

  for (const product of productsResult.data) {
    const allListings = listingsByProduct.get(product.id) ?? []
    const representative = selectRepresentative(allListings)
    if (!representative) continue

    families.push({
      product: product as unknown as Product,
      listings: allListings,
      representative,
      variantCount: allListings.length,
    })
  }

  return limit ? families.slice(0, limit) : families
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

  const candidates = allListings.filter(
    l =>
      l.listing_id !== currentListing.listing_id &&
      l.listing_type !== 'standard' &&
      l.status !== 'sold' &&
      l.status !== 'reserved' &&
      l.storage === currentListing.storage &&
      l.color === currentListing.color &&
      l.condition === currentListing.condition &&
      l.final_price_kes < currentListing.final_price_kes
  )

  if (candidates.length === 0) return null

  // Return the cheapest candidate
  return candidates.reduce((best, current) =>
    current.final_price_kes < best.final_price_kes ? current : best
  )
}

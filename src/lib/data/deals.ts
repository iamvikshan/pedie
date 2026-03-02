import type { ListingWithProduct } from '@app-types/product'
import { getPricingTier } from '@helpers/pricing'
import { createClient } from '@lib/supabase/server'

interface ListingWithDiscount extends ListingWithProduct {
  _discountPct: number
}

function computeDiscount(listing: ListingWithProduct): number {
  if (listing.price_kes <= 0) return 0
  return (
    ((listing.price_kes - listing.final_price_kes) / listing.price_kes) * 100
  )
}

async function fetchDiscountedListings(): Promise<{
  sale: ListingWithDiscount[]
  discounted: ListingWithDiscount[]
}> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, product:products!inner(*, category:categories(*))')
    .eq('status', 'available')

  if (error) {
    console.error('Error fetching deal listings:', error)
    return { sale: [], discounted: [] }
  }

  const listings = data as unknown as ListingWithProduct[]

  const sale: ListingWithDiscount[] = []
  const discounted: ListingWithDiscount[] = []

  for (const listing of listings) {
    if (listing.final_price_kes >= listing.price_kes) continue

    const tier = getPricingTier(
      listing.final_price_kes,
      listing.price_kes,
      listing.is_on_sale
    )
    const pct = computeDiscount(listing)

    if (tier === 'sale') {
      sale.push({ ...listing, _discountPct: pct })
    } else if (tier === 'discounted') {
      discounted.push({ ...listing, _discountPct: pct })
    }
  }

  sale.sort((a, b) => b._discountPct - a._discountPct)
  discounted.sort((a, b) => b._discountPct - a._discountPct)

  return { sale, discounted }
}

function stripDiscount(items: ListingWithDiscount[]): ListingWithProduct[] {
  return items.map(({ _discountPct, ...rest }) => {
    void _discountPct
    return rest as unknown as ListingWithProduct
  })
}

/**
 * Get up to 20 hot-deal items: sale items first, backfill with discounted.
 */
export async function getHotDealsListings(): Promise<ListingWithProduct[]> {
  const { sale, discounted } = await fetchDiscountedListings()
  const combined = [...sale, ...discounted].slice(0, 20)
  return stripDiscount(combined)
}

/**
 * Get all sale + discounted listings. If limit provided, cap at that.
 */
export async function getDealsListings(
  limit?: number
): Promise<ListingWithProduct[]> {
  const { sale, discounted } = await fetchDiscountedListings()
  const combined = [...sale, ...discounted]
  const capped = limit !== undefined ? combined.slice(0, limit) : combined
  return stripDiscount(capped)
}

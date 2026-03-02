import type { ListingWithProduct } from '@app-types/product'
import { calculateDiscount } from '@helpers'
import { createClient } from '@lib/supabase/server'

export async function getFeaturedListings(
  limit: number = 10
): Promise<ListingWithProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, product:products(*, category:categories(*))')
    .eq('is_featured', true)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured listings:', error)
    return []
  }

  return data as unknown as ListingWithProduct[]
}

export async function getLatestListings(
  limit: number = 10
): Promise<ListingWithProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, product:products(*, category:categories(*))')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching latest listings:', error)
    return []
  }

  return data as unknown as ListingWithProduct[]
}

export async function getListingsByCategory(
  categorySlug: string,
  limit: number = 10
): Promise<ListingWithProduct[]> {
  const supabase = await createClient()

  // First get the category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (categoryError || !categoryData) {
    console.error(
      `Error fetching category by slug ${categorySlug}:`,
      categoryError
    )
    return []
  }

  const { data, error } = await supabase
    .from('listings')
    .select('*, product:products!inner(*, category:categories(*))')
    .eq('status', 'available')
    .eq('product.category_id', categoryData.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error(
      `Error fetching listings for category ${categorySlug}:`,
      error
    )
    return []
  }

  return data as unknown as ListingWithProduct[]
}

export async function getDealListings(
  limit: number = 10
): Promise<ListingWithProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, product:products!inner(*, category:categories(*))')
    .eq('status', 'available')
    .limit(limit * 3)

  if (error) {
    console.error('Error fetching deal listings:', error)
    return []
  }

  const listings = data as unknown as ListingWithProduct[]

  // Calculate discount and sort
  const deals = listings
    .map(listing => {
      const discount = calculateDiscount(
        listing.product.original_price_kes,
        listing.price_kes
      )
      return { ...listing, _discount: discount }
    })
    .filter(listing => listing._discount > 0)
    .sort((a, b) => b._discount - a._discount)
    .slice(0, limit)
    .map(listing => {
      const { _discount, ...rest } = listing
      void _discount // Ignore unused variable warning
      return rest as unknown as ListingWithProduct
    })

  return deals
}

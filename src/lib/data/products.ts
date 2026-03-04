import type {
  Listing,
  ListingWithProduct,
  Product,
  ProductFamily,
} from '@app-types/product'
import { calculateDiscount } from '@helpers'
import { getCategoryAndDescendantIds } from '@data/categories'
import { createClient } from '@lib/supabase/server'
import { selectRepresentative } from '@utils/products'

export {
  LISTING_TYPE_PRIORITY,
  selectRepresentative,
  findBetterDeal,
} from '@utils/products'

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
 * Get related product families in the same category (and subcategories), excluding a specific product.
 */
export async function getRelatedFamilies(
  categoryId: string,
  excludeProductId: string,
  limit: number = 4
): Promise<ProductFamily[]> {
  const supabase = await createClient()

  const categoryIds = await getCategoryAndDescendantIds(categoryId)

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .in('category_id', categoryIds)
    .neq('id', excludeProductId)

  if (productsError || !products || products.length === 0) return []

  const productIds = products.map(p => p.id)

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .in('product_id', productIds)
    .not('status', 'in', '(sold,reserved)')
    .order('final_price_kes', { ascending: true })

  if (listingsError || !listings) return []

  const listingsByProduct = new Map<string, Listing[]>()
  for (const listing of listings as unknown as Listing[]) {
    const existing = listingsByProduct.get(listing.product_id) ?? []
    existing.push(listing)
    listingsByProduct.set(listing.product_id, existing)
  }

  const families: ProductFamily[] = []

  for (const product of products) {
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

  return families.slice(0, limit)
}

/**
 * Get related individual listings in the same category, excluding a specific product.
 * Used for SimilarListings component which shows individual product cards.
 */
export async function getRelatedListings(
  categoryId: string,
  excludeProductId: string,
  limit: number = 4
): Promise<ListingWithProduct[]> {
  const supabase = await createClient()

  const categoryIds = await getCategoryAndDescendantIds(categoryId)

  const { data, error } = await supabase
    .from('listings')
    .select('*, product:products!inner(*, category:categories(*))')
    .not('status', 'in', '(sold,reserved)')
    .in('product.category_id', categoryIds)
    .neq('product_id', excludeProductId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching related listings:', error)
    return []
  }

  return data as unknown as ListingWithProduct[]
}

/**
 * Get product families for a specific category by slug.
 * Includes products from all subcategories and from the product_categories junction table.
 */
export async function getProductFamiliesByCategory(
  categorySlug: string,
  limit: number = 8
): Promise<ProductFamily[]> {
  const supabase = await createClient()

  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (categoryError || !categoryData) return []

  const categoryIds = await getCategoryAndDescendantIds(categoryData.id)

  // Get product IDs from the junction table for these categories
  const { data: junctionData } = await supabase
    .from('product_categories')
    .select('product_id')
    .in('category_id', categoryIds)

  const junctionProductIds = (junctionData ?? []).map(j => j.product_id)

  // Query products by direct category_id
  const { data: directProducts, error: directError } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .in('category_id', categoryIds)

  if (directError) return []

  // Query products from junction table (if any)
  let junctionProducts: typeof directProducts = []
  if (junctionProductIds.length > 0) {
    const { data: jp } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .in('id', junctionProductIds)

    junctionProducts = jp ?? []
  }

  // Merge and deduplicate
  const productMap = new Map<string, (typeof directProducts)[number]>()
  for (const p of [...(directProducts ?? []), ...junctionProducts]) {
    productMap.set(p.id, p)
  }
  const products = [...productMap.values()]

  if (products.length === 0) return []

  const productIds = products.map(p => p.id)

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .in('product_id', productIds)
    .not('status', 'in', '(sold,reserved)')
    .order('final_price_kes', { ascending: true })

  if (listingsError || !listings) return []

  const listingsByProduct = new Map<string, Listing[]>()
  for (const listing of listings as unknown as Listing[]) {
    const existing = listingsByProduct.get(listing.product_id) ?? []
    existing.push(listing)
    listingsByProduct.set(listing.product_id, existing)
  }

  const families: ProductFamily[] = []

  for (const product of products) {
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

  return families.slice(0, limit)
}

/* ------------------------------------------------------------------ */
/*  Individual listing queries (hot deals, /deals, latest)            */
/* ------------------------------------------------------------------ */

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

  // Get category and all descendant IDs
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

  const categoryIds = await getCategoryAndDescendantIds(categoryData.id)

  const { data, error } = await supabase
    .from('listings')
    .select('*, product:products!inner(*, category:categories(*))')
    .eq('status', 'available')
    .in('product.category_id', categoryIds)
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

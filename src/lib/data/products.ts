import type {
  Listing,
  ListingWithProduct,
  Product,
  ProductFamily,
} from '@app-types/product'
import { getCategoryAndDescendantIds } from '@data/categories'
import { createClient } from '@lib/supabase/server'
import { selectRepresentative } from '@utils/products'

export {
  LISTING_TYPE_PRIORITY,
  selectRepresentative,
  findBetterDeal,
} from '@utils/products'

const PRODUCT_SELECT = '*, brand:brands(*)'
const LISTING_WITH_PRODUCT_SELECT =
  '*, product:products!inner(*, brand:brands(*))'

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
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .single()

  if (productError || !product) return null

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .eq('product_id', product.id)
    .eq('status', 'active')
    .order('price_kes', { ascending: true })

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
      .select(PRODUCT_SELECT)
      .order('name', { ascending: true }),
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('price_kes', { ascending: true }),
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
 * Get related product families that share a category via product_categories junction table.
 */
export async function getRelatedFamilies(
  productId: string,
  limit: number = 4
): Promise<ProductFamily[]> {
  const supabase = await createClient()

  // Get categories for the given product
  const { data: productCats } = await supabase
    .from('product_categories')
    .select('category_id')
    .eq('product_id', productId)

  if (!productCats || productCats.length === 0) return []

  const categoryIds = productCats.map(pc => pc.category_id)

  // Get all descendant category IDs
  const allCatIds = await Promise.all(
    categoryIds.map(id => getCategoryAndDescendantIds(id))
  )
  const expandedCatIds = [...new Set(allCatIds.flat())]

  // Get related product IDs from junction table
  const { data: relatedJunction } = await supabase
    .from('product_categories')
    .select('product_id')
    .in('category_id', expandedCatIds)

  const relatedProductIds = [
    ...new Set(
      (relatedJunction ?? [])
        .map(j => j.product_id)
        .filter(id => id !== productId)
    ),
  ]

  if (relatedProductIds.length === 0) return []

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .in('id', relatedProductIds)

  if (productsError || !products || products.length === 0) return []

  const productIds = products.map(p => p.id)

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .in('product_id', productIds)
    .eq('status', 'active')
    .order('price_kes', { ascending: true })

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
 * Get related individual listings that share a category, excluding a specific product.
 */
export async function getRelatedListings(
  productId: string,
  limit: number = 4
): Promise<ListingWithProduct[]> {
  const supabase = await createClient()

  // Get categories for the given product
  const { data: productCats } = await supabase
    .from('product_categories')
    .select('category_id')
    .eq('product_id', productId)

  if (!productCats || productCats.length === 0) return []

  const categoryIds = productCats.map(pc => pc.category_id)
  const allCatIds = await Promise.all(
    categoryIds.map(id => getCategoryAndDescendantIds(id))
  )
  const expandedCatIds = [...new Set(allCatIds.flat())]

  // Get related product IDs from junction table
  const { data: relatedJunction } = await supabase
    .from('product_categories')
    .select('product_id')
    .in('category_id', expandedCatIds)

  const relatedProductIds = [
    ...new Set(
      (relatedJunction ?? [])
        .map(j => j.product_id)
        .filter(id => id !== productId)
    ),
  ]

  if (relatedProductIds.length === 0) return []

  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_WITH_PRODUCT_SELECT)
    .eq('status', 'active')
    .in('product_id', relatedProductIds)
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
 * Uses product_categories junction table.
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

  const junctionProductIds = [
    ...new Set((junctionData ?? []).map(j => j.product_id)),
  ]

  if (junctionProductIds.length === 0) return []

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .in('id', junctionProductIds)

  if (productsError || !products || products.length === 0) return []

  const productIds = products.map(p => p.id)

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .in('product_id', productIds)
    .eq('status', 'active')
    .order('price_kes', { ascending: true })

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
    .select(LISTING_WITH_PRODUCT_SELECT)
    .eq('is_featured', true)
    .eq('status', 'active')
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
    .select(LISTING_WITH_PRODUCT_SELECT)
    .eq('status', 'active')
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

  // Get product IDs from junction table
  const { data: junctionData } = await supabase
    .from('product_categories')
    .select('product_id')
    .in('category_id', categoryIds)

  const productIds = [...new Set((junctionData ?? []).map(j => j.product_id))]

  if (productIds.length === 0) return []

  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_WITH_PRODUCT_SELECT)
    .eq('status', 'active')
    .in('product_id', productIds)
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

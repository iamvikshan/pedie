import type {
  AvailableFilters,
  ListingFilters,
  PaginatedResult,
  PaginationParams,
  SortOption,
} from '@app-types/filters'
import type { ConditionGrade, ListingWithProduct } from '@app-types/product'
import { getCategoryAndDescendantIds } from '@data/categories'
import { createClient } from '@lib/supabase/server'

const LISTING_SELECT = '*, product:products!inner(*, brand:brands(*))'

function emptyPaginatedResult<T>(
  pagination: PaginationParams
): PaginatedResult<T> {
  return {
    data: [],
    total: 0,
    page: pagination.page,
    perPage: pagination.perPage,
    totalPages: 0,
  }
}

export async function getFilteredListings(
  categorySlug: string | null,
  filters: ListingFilters,
  sort: SortOption,
  pagination: PaginationParams
): Promise<PaginatedResult<ListingWithProduct>> {
  const supabase = await createClient()

  let productIds: string[] | null = null

  if (categorySlug) {
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
      return emptyPaginatedResult(pagination)
    }

    const descendantIds = await getCategoryAndDescendantIds(categoryData.id)

    // Get product IDs via junction table
    const { data: junctionData } = await supabase
      .from('product_categories')
      .select('product_id')
      .in('category_id', descendantIds)

    productIds = (junctionData ?? []).map(j => j.product_id)
  }

  // Handle category sub-filter
  if (filters.category && filters.category.length > 0) {
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .in('slug', filters.category)

    if (catData && catData.length > 0) {
      const allSubIds = await Promise.all(
        catData.map(c => getCategoryAndDescendantIds(c.id))
      )
      const subCatIds = new Set(allSubIds.flat())

      const { data: subJunction } = await supabase
        .from('product_categories')
        .select('product_id')
        .in('category_id', [...subCatIds])

      const subProductIds = new Set((subJunction ?? []).map(j => j.product_id))

      if (productIds) {
        productIds = productIds.filter(id => subProductIds.has(id))
      } else {
        productIds = [...subProductIds]
      }
    } else {
      productIds = []
    }
  }

  // Resolve brand filter to product IDs (nested relation filters don't work on count queries)
  if (filters.brand && filters.brand.length > 0) {
    const { data: brandData } = await supabase
      .from('brands')
      .select('id')
      .in('slug', filters.brand)

    const brandIds = (brandData ?? []).map(b => b.id)

    if (brandIds.length === 0) return emptyPaginatedResult(pagination)

    const { data: brandProducts } = await supabase
      .from('products')
      .select('id')
      .in('brand_id', brandIds)

    const brandProductIds = new Set((brandProducts ?? []).map(p => p.id))

    if (productIds) {
      productIds = productIds.filter(id => brandProductIds.has(id))
    } else {
      productIds = [...brandProductIds]
    }

    if (productIds.length === 0) return emptyPaginatedResult(pagination)
  }

  // Build data query
  let query = supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'active')

  if (productIds) {
    if (productIds.length === 0) return emptyPaginatedResult(pagination)
    query = query.in('product_id', productIds)
  }

  // Apply filters
  if (filters.condition && filters.condition.length > 0) {
    query = query.in('condition', filters.condition)
  }
  if (filters.storage && filters.storage.length > 0) {
    query = query.in('storage', filters.storage)
  }
  if (filters.color && filters.color.length > 0) {
    query = query.in('color', filters.color)
  }
  if (filters.priceMin !== undefined) {
    query = query.gte('price_kes', filters.priceMin)
  }
  if (filters.priceMax !== undefined) {
    query = query.lte('price_kes', filters.priceMax)
  }

  // Apply sort
  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'price-asc':
      query = query.order('price_kes', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price_kes', { ascending: false })
      break
  }

  // Apply pagination
  const from = (pagination.page - 1) * pagination.perPage
  const to = from + pagination.perPage - 1
  query = query.range(from, to)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching filtered listings:', error)
    return emptyPaginatedResult(pagination)
  }

  // Count query
  let countQuery = supabase
    .from('listings')
    .select('id', {
      count: 'exact',
      head: true,
    } as never)
    .eq('status', 'active')

  if (productIds) {
    countQuery = countQuery.in('product_id', productIds)
  }

  if (filters.condition && filters.condition.length > 0) {
    countQuery = countQuery.in('condition', filters.condition)
  }
  if (filters.storage && filters.storage.length > 0) {
    countQuery = countQuery.in('storage', filters.storage)
  }
  if (filters.color && filters.color.length > 0) {
    countQuery = countQuery.in('color', filters.color)
  }
  if (filters.priceMin !== undefined) {
    countQuery = countQuery.gte('price_kes', filters.priceMin)
  }
  if (filters.priceMax !== undefined) {
    countQuery = countQuery.lte('price_kes', filters.priceMax)
  }

  const { count } = (await countQuery) as unknown as { count: number | null }
  const total = count ?? 0

  return {
    data: (data as unknown as ListingWithProduct[]) ?? [],
    total,
    page: pagination.page,
    perPage: pagination.perPage,
    totalPages: Math.ceil(total / pagination.perPage),
  }
}

export async function getListingById(
  listingId: string
): Promise<ListingWithProduct | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('id', listingId)
    .single()

  if (error || !data) {
    console.error(`Error fetching listing ${listingId}:`, error)
    return null
  }

  return data as unknown as ListingWithProduct
}

export async function getListingBySku(
  sku: string
): Promise<ListingWithProduct | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('sku', sku)
    .single()

  if (error || !data) {
    console.error(`Error fetching listing by SKU ${sku}:`, error)
    return null
  }

  return data as unknown as ListingWithProduct
}

export async function getSimilarListings(
  productId: string,
  excludeListingId: string,
  limit: number = 4
): Promise<ListingWithProduct[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('product_id', productId)
    .neq('id', excludeListingId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching similar listings:', error)
    return []
  }

  return (data as unknown as ListingWithProduct[]) ?? []
}

export async function getAvailableFilters(
  categorySlug: string | null
): Promise<AvailableFilters> {
  const emptyFilters: AvailableFilters = {
    conditions: [],
    storages: [],
    colors: [],
    brands: [],
    priceRange: { min: 0, max: 0 },
    categories: [],
  }

  const supabase = await createClient()

  let productIds: string[] | null = null

  if (categorySlug) {
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
      return emptyFilters
    }

    const descendantIds = await getCategoryAndDescendantIds(categoryData.id)

    const { data: junctionData } = await supabase
      .from('product_categories')
      .select('product_id')
      .in('category_id', descendantIds)

    productIds = (junctionData ?? []).map(j => j.product_id)
  }

  // Fetch listings to extract filter values
  let listingsQuery = supabase
    .from('listings')
    .select(
      'storage, color, condition, price_kes, product:products!inner(brand:brands(name, slug))'
    )
    .eq('status', 'active')

  if (productIds) {
    if (productIds.length === 0) return emptyFilters
    listingsQuery = listingsQuery.in('product_id', productIds)
  }

  const { data: listings, error: listingsError } = await listingsQuery

  if (listingsError || !listings) {
    console.error('Error fetching filter data:', listingsError)
    return emptyFilters
  }

  const listingData = listings as unknown as Array<{
    storage: string | null
    color: string | null
    condition: ConditionGrade
    price_kes: number
    product: {
      brand: { name: string; slug: string } | null
    } | null
  }>

  const conditions = [
    ...new Set(listingData.map(l => l.condition).filter(Boolean)),
  ] as ConditionGrade[]
  const storages = [
    ...new Set(listingData.map(l => l.storage).filter(Boolean)),
  ] as string[]
  const colors = [
    ...new Set(listingData.map(l => l.color).filter(Boolean)),
  ] as string[]
  const brands = [
    ...new Set(
      listingData
        .map(l => l.product?.brand?.slug)
        .filter((b): b is string => b != null && b !== '')
    ),
  ]

  const prices = listingData.map(l => l.price_kes).filter(p => p != null)
  const min = prices.length > 0 ? Math.min(...prices) : 0
  const max = prices.length > 0 ? Math.max(...prices) : 0

  // Build category counts from junction table
  let categoryCountQuery = supabase
    .from('product_categories')
    .select('category_id, category:categories(name, slug)')

  if (productIds) {
    categoryCountQuery = categoryCountQuery.in('product_id', productIds)
  }

  const { data: catCountData } = await categoryCountQuery

  const categoryCounts = new Map<
    string,
    { name: string; slug: string; count: number }
  >()
  for (const row of (catCountData ?? []) as unknown as Array<{
    category_id: string
    category: { name: string; slug: string } | null
  }>) {
    const cat = row.category
    if (cat?.slug) {
      const existing = categoryCounts.get(cat.slug)
      if (existing) {
        existing.count++
      } else {
        categoryCounts.set(cat.slug, {
          name: cat.name,
          slug: cat.slug,
          count: 1,
        })
      }
    }
  }

  const categories = [...categoryCounts.values()].sort(
    (a, b) => b.count - a.count
  )

  return {
    conditions,
    storages,
    colors,
    brands,
    priceRange: { min, max },
    categories,
  }
}

/* ------------------------------------------------------------------ */
/*  Promotion listings                                                */
/* ------------------------------------------------------------------ */

function computeDiscount(listing: ListingWithProduct): number {
  if (
    listing.sale_price_kes == null ||
    !Number.isFinite(listing.price_kes) ||
    !Number.isFinite(listing.sale_price_kes) ||
    listing.price_kes <= 0 ||
    listing.sale_price_kes < 0 ||
    listing.sale_price_kes >= listing.price_kes
  )
    return 0
  const pct =
    ((listing.price_kes - listing.sale_price_kes) / listing.price_kes) * 100
  return Math.min(100, Math.max(0, pct))
}

export function applyPromotionDiscount(
  listing: ListingWithProduct,
  promotion: { discount_pct: number | null; discount_amount_kes: number | null }
): ListingWithProduct {
  let effectivePrice: number | null = null

  if (
    promotion.discount_pct != null &&
    promotion.discount_pct > 0 &&
    promotion.discount_pct <= 100
  ) {
    effectivePrice = Math.round(
      listing.price_kes * (1 - promotion.discount_pct / 100)
    )
  } else if (
    promotion.discount_amount_kes != null &&
    promotion.discount_amount_kes > 0
  ) {
    effectivePrice = Math.max(
      0,
      listing.price_kes - promotion.discount_amount_kes
    )
  }

  if (effectivePrice == null) return listing

  // Only apply if promotion gives a better price than existing sale_price_kes
  if (
    listing.sale_price_kes != null &&
    listing.sale_price_kes <= effectivePrice
  ) {
    return listing
  }

  return { ...listing, sale_price_kes: effectivePrice }
}

export async function getActivePromotions() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('promotions')
    .select('*, listing:listings(*), product:products(*)')
    .eq('is_active', true)
    .lte('starts_at', now)
    .gt('ends_at', now)

  if (error) {
    console.error('Error fetching active promotions:', error)
    return []
  }

  return data ?? []
}

/**
 * Fetch active listings with a valid sale_price_kes, sorted by discount percentage.
 * Also merges listings targeted by active promotions from the promotions table.
 */
async function fetchPromotionListings(): Promise<ListingWithProduct[]> {
  const supabase = await createClient()

  // 1. Listings with direct sale_price_kes
  const { data: saleListings, error: saleError } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'active')
    .not('sale_price_kes', 'is', null)

  if (saleError) {
    console.error('Error fetching promotion listings:', saleError)
  }

  const listingsMap = new Map<string, ListingWithProduct>()
  for (const l of (saleListings ?? []) as unknown as ListingWithProduct[]) {
    listingsMap.set(l.id, l)
  }

  // 2. Get active promotions
  const now = new Date().toISOString()
  const { data: promotions, error: promoError } = await supabase
    .from('promotions')
    .select('listing_id, product_id, discount_pct, discount_amount_kes')
    .eq('is_active', true)
    .lte('starts_at', now)
    .gt('ends_at', now)

  if (promoError) {
    console.error('Error fetching promotions:', promoError)
  }

  if (promotions && promotions.length > 0) {
    // Promotion-targeted listings
    const promoListingIds = promotions
      .filter(p => p.listing_id != null)
      .map(p => p.listing_id!)

    if (promoListingIds.length > 0) {
      const { data: promoListings } = await supabase
        .from('listings')
        .select(LISTING_SELECT)
        .in('id', promoListingIds)
        .eq('status', 'active')

      for (const l of (promoListings ??
        []) as unknown as ListingWithProduct[]) {
        const promo = promotions.find(p => p.listing_id === l.id)
        if (promo) {
          const updated = applyPromotionDiscount(l, promo)
          listingsMap.set(updated.id, updated)
        }
      }
    }

    // Promotion-targeted products (apply to all active listings of that product)
    const promoProductIds = promotions
      .filter(p => p.product_id != null)
      .map(p => p.product_id!)

    if (promoProductIds.length > 0) {
      const { data: productListings } = await supabase
        .from('listings')
        .select(LISTING_SELECT)
        .in('product_id', promoProductIds)
        .eq('status', 'active')

      for (const l of (productListings ??
        []) as unknown as ListingWithProduct[]) {
        const promo = promotions.find(p => p.product_id === l.product_id)
        if (promo) {
          const base = listingsMap.get(l.id) ?? l
          const updated = applyPromotionDiscount(base, promo)
          listingsMap.set(updated.id, updated)
        }
      }
    }
  }

  return [...listingsMap.values()]
    .map(l => ({ listing: l, discount: computeDiscount(l) }))
    .filter(({ discount }) => discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .map(({ listing }) => listing)
}

/**
 * Get up to 20 hot promotion listings sorted by discount percentage.
 */
export async function getHotPromotionListings(): Promise<ListingWithProduct[]> {
  const listings = await fetchPromotionListings()
  return listings.slice(0, 20)
}

/**
 * Get all promotion listings. If limit provided, cap at that.
 */
export async function getPromotionListings(
  limit?: number
): Promise<ListingWithProduct[]> {
  const listings = await fetchPromotionListings()
  return limit !== undefined ? listings.slice(0, limit) : listings
}

import type {
  AvailableFilters,
  ListingFilters,
  PaginatedResult,
  PaginationParams,
} from '@app-types/filters'
import type { ConditionGrade, ListingWithProduct } from '@app-types/product'
import { createClient } from '@lib/supabase/server'

const DEFAULT_PAGINATION: PaginationParams = { page: 1, perPage: 20 }

/**
 * Maximum number of product IDs returned by the FTS stage.
 * This caps the .in('product_id', ...) clause to avoid exceeding URL length limits.
 * If the catalogue grows beyond this, consider paging the FTS or using a server-side RPC.
 */
const MAX_FTS_CANDIDATES = 100

const LISTING_WITH_PRODUCT_SELECT = '*, product:products(*, brand:brands(*))'

export async function searchListings(
  query: string,
  filters?: ListingFilters,
  pagination?: PaginationParams
): Promise<PaginatedResult<ListingWithProduct>> {
  const pag = pagination ?? DEFAULT_PAGINATION

  const supabase = await createClient()

  // Step 1: Search products using FTS
  const { data: matchedProducts, error: searchError } = await supabase
    .from('products')
    .select('id')
    .textSearch('fts', query, { type: 'websearch' })
    .limit(MAX_FTS_CANDIDATES)

  if (searchError || !matchedProducts) {
    console.error('Error searching products:', searchError)
    return {
      data: [],
      total: 0,
      page: pag.page,
      perPage: pag.perPage,
      totalPages: 0,
    }
  }

  let productIds = (matchedProducts as unknown as Array<{ id: string }>).map(
    p => p.id
  )

  if (productIds.length === 0) {
    return {
      data: [],
      total: 0,
      page: pag.page,
      perPage: pag.perPage,
      totalPages: 0,
    }
  }

  // Step 2: Resolve brand filter to product IDs if needed
  if (filters?.brand && filters.brand.length > 0) {
    const { data: brandData } = await supabase
      .from('brands')
      .select('id')
      .in('slug', filters.brand)

    const brandIds = (brandData ?? []).map(b => b.id)

    if (brandIds.length === 0) {
      return {
        data: [],
        total: 0,
        page: pag.page,
        perPage: pag.perPage,
        totalPages: 0,
      }
    }

    const { data: brandProducts } = await supabase
      .from('products')
      .select('id')
      .in('brand_id', brandIds)

    const brandProductIds = new Set(
      (brandProducts ?? []).map(p => p.id)
    )

    productIds = productIds.filter(id => brandProductIds.has(id))

    if (productIds.length === 0) {
      return {
        data: [],
        total: 0,
        page: pag.page,
        perPage: pag.perPage,
        totalPages: 0,
      }
    }
  }

  // Step 3: Fetch listings for matched products
  let listingQuery = supabase
    .from('listings')
    .select(LISTING_WITH_PRODUCT_SELECT)
    .eq('status', 'active')
    .in('product_id', productIds)

  // Apply optional filters
  if (filters?.condition && filters.condition.length > 0) {
    listingQuery = listingQuery.in('condition', filters.condition)
  }
  if (filters?.storage && filters.storage.length > 0) {
    listingQuery = listingQuery.in('storage', filters.storage)
  }
  if (filters?.color && filters.color.length > 0) {
    listingQuery = listingQuery.in('color', filters.color)
  }
  if (filters?.priceMin !== undefined) {
    listingQuery = listingQuery.gte('price_kes', filters.priceMin)
  }
  if (filters?.priceMax !== undefined) {
    listingQuery = listingQuery.lte('price_kes', filters.priceMax)
  }

  // Apply sort (default: newest)
  listingQuery = listingQuery.order('created_at', { ascending: false })

  // Apply pagination
  const from = (pag.page - 1) * pag.perPage
  const to = from + pag.perPage - 1
  listingQuery = listingQuery.range(from, to)

  const { data, error } = await listingQuery

  if (error) {
    console.error('Error fetching search listings:', error)
    return {
      data: [],
      total: 0,
      page: pag.page,
      perPage: pag.perPage,
      totalPages: 0,
    }
  }

  // Count query
  let countQuery = supabase
    .from('listings')
    .select('id', { count: 'exact', head: true } as never)
    .eq('status', 'active')
    .in('product_id', productIds)

  if (filters?.condition && filters.condition.length > 0) {
    countQuery = countQuery.in('condition', filters.condition)
  }
  if (filters?.storage && filters.storage.length > 0) {
    countQuery = countQuery.in('storage', filters.storage)
  }
  if (filters?.color && filters.color.length > 0) {
    countQuery = countQuery.in('color', filters.color)
  }
  if (filters?.priceMin !== undefined) {
    countQuery = countQuery.gte('price_kes', filters.priceMin)
  }
  if (filters?.priceMax !== undefined) {
    countQuery = countQuery.lte('price_kes', filters.priceMax)
  }

  const { count, error: countError } = (await countQuery) as unknown as {
    count: number | null
    error?: { message: string } | null
  }
  if (countError) {
    console.error('Error fetching search count:', countError.message)
  }
  const safePerPage = Math.max(1, pag.perPage)

  let total: number
  if (countError) {
    const dataLen = (data as unknown[])?.length ?? 0
    total = from + dataLen + (dataLen >= safePerPage ? 1 : 0)
  } else {
    total = count ?? 0
  }

  return {
    data: (data as unknown as ListingWithProduct[]) ?? [],
    total,
    page: pag.page,
    perPage: safePerPage,
    totalPages: Math.ceil(total / safePerPage),
  }
}

// Types for suggestions
export interface SearchSuggestion {
  name: string
  slug: string
  brandName?: string
  minPrice?: number
}

export async function getSearchSuggestions(
  query: string,
  limit = 8
): Promise<SearchSuggestion[]> {
  if (!query.trim()) return []
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('name, slug, brand:brands(name)')
    .textSearch('fts', query, { type: 'websearch' })
    .limit(limit)

  if (error || !data) return []

  return data.map(
    (p: { name: string; slug: string; brand: { name: string } | null }) => ({
      name: p.name,
      slug: p.slug,
      brandName: p.brand?.name ?? undefined,
    })
  )
}

export async function getAvailableFilters(
  query: string
): Promise<AvailableFilters> {
  const supabase = await createClient()
  const empty: AvailableFilters = {
    conditions: [],
    storages: [],
    colors: [],
    brands: [],
    priceRange: { min: 0, max: 0 },
    categories: [],
  }

  // Get product IDs matching query
  const { data: matched } = await supabase
    .from('products')
    .select('id')
    .textSearch('fts', query, { type: 'websearch' })
    .limit(MAX_FTS_CANDIDATES)

  if (!matched || matched.length === 0) return empty

  const ids = matched.map((p: { id: string }) => p.id)

  // Fetch distinct values from available listings
  const { data: listings } = await supabase
    .from('listings')
    .select(
      'condition, storage, color, price_kes, product:products(brand:brands(name, slug))'
    )
    .eq('status', 'active')
    .in('product_id', ids)

  if (!listings || listings.length === 0) return empty

  const conditions = new Set<string>()
  const storages = new Set<string>()
  const colors = new Set<string>()
  const brands = new Set<string>()
  let min = Infinity,
    max = 0

  for (const l of listings as Array<{
    condition: string | null
    storage: string | null
    color: string | null
    price_kes: number | null
    product: { brand: { name: string; slug: string } | null } | null
  }>) {
    if (l.condition) conditions.add(l.condition)
    if (l.storage) storages.add(l.storage)
    if (l.color) colors.add(l.color)
    if (l.product?.brand?.slug) brands.add(l.product.brand.slug)
    if (typeof l.price_kes === 'number') {
      min = Math.min(min, l.price_kes)
      max = Math.max(max, l.price_kes)
    }
  }

  return {
    conditions: [...conditions] as ConditionGrade[],
    storages: [...storages],
    colors: [...colors],
    brands: [...brands],
    priceRange: { min: min === Infinity ? 0 : min, max },
    categories: [],
  }
}

import type {
  ListingFilters,
  PaginatedResult,
  PaginationParams,
} from '@app-types/filters'
import type { ListingWithProduct } from '@app-types/product'
import { createClient } from '@lib/supabase/server'

const DEFAULT_PAGINATION: PaginationParams = { page: 1, perPage: 20 }

/**
 * Maximum number of product IDs returned by the FTS stage.
 * This caps the .in('product_id', ...) clause to avoid exceeding URL length limits.
 * If the catalogue grows beyond this, consider paging the FTS or using a server-side RPC.
 */
const MAX_FTS_CANDIDATES = 100

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
    // TODO: If catalogue grows beyond MAX_FTS_CANDIDATES, revisit architecture
    // (paginate FTS results or move join into a server-side RPC)
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

  const productIds = (matchedProducts as unknown as Array<{ id: string }>).map(
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

  // Step 2: Fetch listings for matched products
  let listingQuery = supabase
    .from('listings')
    .select('*, product:products(*, category:categories(*))')
    .eq('status', 'available')
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
  if (filters?.carrier && filters.carrier.length > 0) {
    listingQuery = listingQuery.in('carrier', filters.carrier)
  }
  if (filters?.brand && filters.brand.length > 0) {
    listingQuery = listingQuery.in('product.brand', filters.brand)
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
    .select('*', { count: 'exact', head: true } as never)
    .eq('status', 'available')
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
  if (filters?.carrier && filters.carrier.length > 0) {
    countQuery = countQuery.in('carrier', filters.carrier)
  }
  if (filters?.brand && filters.brand.length > 0) {
    countQuery = countQuery.in('product.brand', filters.brand)
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

  // Fall back to from + data.length when count query fails, so pagination stays usable.
  // When a full page is returned, add 1 so consumers see a possible next page.
  // TRADEOFF: This heuristic may produce a phantom "next" link when the true total
  // is exactly a multiple of perPage (the extra page will be empty). This is a deliberate
  // UX choice — showing an empty last page is preferable to hiding real results when the
  // count query is unavailable. The flicker is expected and self-corrects on the next load.
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

import { createClient } from '@lib/supabase/server'
import type { ListingWithProduct } from '@app-types/product'
import type {
  ListingFilters,
  PaginationParams,
  PaginatedResult,
} from '@app-types/filters'

const DEFAULT_PAGINATION: PaginationParams = { page: 1, perPage: 20 }

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
  const total = count ?? (data as unknown[])?.length ?? 0

  return {
    data: (data as unknown as ListingWithProduct[]) ?? [],
    total,
    page: pag.page,
    perPage: pag.perPage,
    totalPages: Math.ceil(total / pag.perPage),
  }
}

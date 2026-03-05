import type {
  AvailableFilters,
  ListingFilters,
  PaginatedResult,
  PaginationParams,
  SortOption,
} from '@app-types/filters'
import type { ConditionGrade, ListingWithProduct } from '@app-types/product'
import { createClient } from '@lib/supabase/server'

const LISTING_SELECT =
  '*, product:products!inner(*, category:categories!products_category_id_fkey(*))'

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
  categorySlug: string,
  filters: ListingFilters,
  sort: SortOption,
  pagination: PaginationParams
): Promise<PaginatedResult<ListingWithProduct>> {
  const supabase = await createClient()

  // Get category ID
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

  const categoryId = categoryData.id

  // Build data query
  let query = supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'available')
    .eq('product.category_id', categoryId)

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
  if (filters.carrier && filters.carrier.length > 0) {
    query = query.in('carrier', filters.carrier)
  }
  if (filters.brand && filters.brand.length > 0) {
    query = query.in('product.brand', filters.brand)
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

  // Count query — include product join so embedded filters (product.category_id, product.brand) resolve
  let countQuery = supabase
    .from('listings')
    .select('*, product:products!inner(id, category_id, brand)', {
      count: 'exact',
      head: true,
    } as never)
    .eq('status', 'available')
    .eq('product.category_id', categoryId)

  if (filters.condition && filters.condition.length > 0) {
    countQuery = countQuery.in('condition', filters.condition)
  }
  if (filters.storage && filters.storage.length > 0) {
    countQuery = countQuery.in('storage', filters.storage)
  }
  if (filters.color && filters.color.length > 0) {
    countQuery = countQuery.in('color', filters.color)
  }
  if (filters.carrier && filters.carrier.length > 0) {
    countQuery = countQuery.in('carrier', filters.carrier)
  }
  if (filters.brand && filters.brand.length > 0) {
    countQuery = countQuery.in('product.brand', filters.brand)
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
    .select(
      '*, product:products(*, category:categories!products_category_id_fkey(*))'
    )
    .eq('listing_id', listingId)
    .single()

  if (error || !data) {
    console.error(`Error fetching listing ${listingId}:`, error)
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
    .select(
      '*, product:products(*, category:categories!products_category_id_fkey(*))'
    )
    .eq('product_id', productId)
    .neq('listing_id', excludeListingId)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching similar listings:', error)
    return []
  }

  return (data as unknown as ListingWithProduct[]) ?? []
}

export async function getAvailableFilters(
  categorySlug: string
): Promise<AvailableFilters> {
  const emptyFilters: AvailableFilters = {
    conditions: [],
    storages: [],
    colors: [],
    carriers: [],
    brands: [],
    priceRange: { min: 0, max: 0 },
  }

  const supabase = await createClient()

  // Get category ID
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

  const categoryId = categoryData.id

  // Fetch listings for this category to extract filter values
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(
      'storage, color, carrier, condition, price_kes, product:products!inner(brand)'
    )
    .eq('status', 'available')
    .eq('product.category_id', categoryId)

  if (listingsError || !listings) {
    console.error('Error fetching filter data:', listingsError)
    return emptyFilters
  }

  const listingData = listings as unknown as Array<{
    storage: string | null
    color: string | null
    carrier: string | null
    condition: ConditionGrade
    price_kes: number
    product: { brand: string } | null
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
  const carriers = [
    ...new Set(listingData.map(l => l.carrier).filter(Boolean)),
  ] as string[]
  const brands = [
    ...new Set(
      listingData
        .map(l => l.product?.brand)
        .filter((b): b is string => b != null && b !== '')
    ),
  ]

  const prices = listingData.map(l => l.price_kes).filter(p => p != null)
  const min = prices.length > 0 ? Math.min(...prices) : 0
  const max = prices.length > 0 ? Math.max(...prices) : 0

  return {
    conditions,
    storages,
    colors,
    carriers,
    brands,
    priceRange: { min, max },
  }
}

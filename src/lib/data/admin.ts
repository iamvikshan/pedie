import type { Database, Json } from '@app-types/database'
import { createAdminClient } from '@lib/supabase/admin'
import { z } from 'zod/v4'

type OrderStatus = Database['public']['Enums']['order_status']
type ListingStatus = Database['public']['Enums']['listing_status']
type ConditionGrade = Database['public']['Enums']['condition_grade']
type UserRole = Database['public']['Enums']['user_role']

type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']
type ListingInsert = Database['public']['Tables']['listings']['Insert']
type ListingUpdate = Database['public']['Tables']['listings']['Update']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']
type OrderUpdate = Database['public']['Tables']['orders']['Update']

const conditionGrades = [
  'new',
  'premium',
  'excellent',
  'good',
  'acceptable',
  'for_parts',
] as const
const listingStatuses = [
  'draft',
  'active',
  'reserved',
  'sold',
  'returned',
  'archived',
] as const
const listingTypes = ['standard', 'preorder', 'affiliate', 'referral'] as const

export const productCreateSchema = z.object({
  brand_id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullish(),
  images: z.array(z.string()).nullish(),
  key_features: z.array(z.string()).nullish(),
  specs: z.record(z.string(), z.unknown()).nullish(),
})

export const productUpdateSchema = productCreateSchema.partial()

export const listingCreateSchema = z.object({
  product_id: z.string().min(1),
  price_kes: z.number().positive(),
  condition: z.enum(conditionGrades),
  storage: z.string().nullish(),
  color: z.string().nullish(),
  battery_health: z.number().min(0).max(100).nullish(),
  sale_price_kes: z.number().nonnegative().nullish(),
  cost_kes: z.number().nonnegative().nullish(),
  images: z.array(z.string()).nullish(),
  is_featured: z.boolean().optional(),
  status: z.enum(listingStatuses).optional(),
  listing_type: z.enum(listingTypes).optional(),
  source: z.string().nullish(),
  source_id: z.string().nullish(),
  source_url: z.string().url().nullish(),
  warranty_months: z.number().nonnegative().nullish(),
  attributes: z.record(z.string(), z.unknown()).nullish(),
  includes: z.array(z.string()).nullish(),
  admin_notes: z.string().nullish(),
  quantity: z.number().int().nonnegative().optional(),
  notes: z.union([z.string(), z.array(z.string())]).nullish(),
})

export const listingUpdateSchema = listingCreateSchema.partial()

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  image_url: z.string().url().nullish(),
  parent_id: z.string().nullish(),
  sort_order: z.number().int().nonnegative().optional(),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalRevenue: number
  ordersToday: number
  pendingOrders: number
  activeListings: number
  totalCustomers: number
}

export interface AdminOrderFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface AdminListingFilters {
  status?: string
  condition?: string
  search?: string
  categoryId?: string
  page?: number
  limit?: number
}

export interface AdminProductFilters {
  search?: string
  categoryId?: string
  page?: number
  limit?: number
}

export interface AdminCustomerFilters {
  search?: string
  role?: string
  page?: number
  limit?: number
}

export interface AdminReviewFilters {
  rating?: number
  page?: number
  limit?: number
}

export interface AdminPaginatedResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export interface RevenueDataPoint {
  date: string
  revenue: number
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = createAdminClient()

  // Total revenue from completed orders
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_kes')
    .in('status', ['confirmed', 'processing', 'shipped', 'delivered'])

  const totalRevenue =
    revenueData?.reduce((sum, o) => sum + (o.total_kes || 0), 0) ?? 0

  // Orders today (using EAT / UTC+3 timezone)
  const now = new Date()
  const eatOffset = 3 * 60 * 60 * 1000 // UTC+3
  const eatNow = new Date(now.getTime() + eatOffset)
  const todayStart = new Date(
    Date.UTC(
      eatNow.getUTCFullYear(),
      eatNow.getUTCMonth(),
      eatNow.getUTCDate()
    ) - eatOffset
  )
  const { count: ordersToday } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart.toISOString())

  // Pending orders
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Active listings
  const { count: activeListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Total customers
  const { count: totalCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')

  return {
    totalRevenue,
    ordersToday: ordersToday ?? 0,
    pendingOrders: pendingOrders ?? 0,
    activeListings: activeListings ?? 0,
    totalCustomers: totalCustomers ?? 0,
  }
}

// ── Revenue Data ───────────────────────────────────────────────────────────

export async function getRevenueData(
  days: number = 30
): Promise<RevenueDataPoint[]> {
  const supabase = createAdminClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: orders } = await supabase
    .from('orders')
    .select('total_kes, created_at')
    .in('status', ['confirmed', 'processing', 'shipped', 'delivered'])
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  // Group by date
  const revenueMap = new Map<string, number>()

  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const dateStr = d.toISOString().split('T')[0]
    revenueMap.set(dateStr, 0)
  }

  // Sum revenue per day
  for (const order of orders ?? []) {
    if (order.created_at) {
      const dateStr = order.created_at.split('T')[0]
      revenueMap.set(dateStr, (revenueMap.get(dateStr) ?? 0) + order.total_kes)
    }
  }

  return Array.from(revenueMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }))
}

// ── Orders (admin view) ────────────────────────────────────────────────────

export async function getAdminOrders(
  filters: AdminOrderFilters = {}
): Promise<AdminPaginatedResult<Record<string, unknown>>> {
  const supabase = createAdminClient()
  const page = filters.page ?? 1
  const limit = filters.limit ?? 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('orders')
    .select('*, profile:profiles(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status as OrderStatus)
  }

  if (filters.search) {
    const sanitized = filters.search.replace(/[^a-zA-Z0-9\s@._-]/g, '')
    query = query.or(`id.ilike.%${sanitized}%,payment_ref.ilike.%${sanitized}%`)
  }

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching admin orders:', error)
    return { data: [], total: 0, page, totalPages: 0 }
  }

  const total = count ?? 0
  return {
    data: (data as Record<string, unknown>[]) ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

// ── Listings CRUD ──────────────────────────────────────────────────────────

export async function getAdminListings(
  filters: AdminListingFilters = {}
): Promise<AdminPaginatedResult<Record<string, unknown>>> {
  const supabase = createAdminClient()
  const page = filters.page ?? 1
  const limit = filters.limit ?? 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('listings')
    .select('*, product:products(name, brand:brands(name))', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status as ListingStatus)
  }
  if (filters.condition) {
    query = query.eq('condition', filters.condition as ConditionGrade)
  }
  if (filters.search) {
    const sanitized = filters.search.replace(/[^a-zA-Z0-9\s@._-]/g, '')
    query = query.ilike('sku', `%${sanitized}%`)
  }

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching admin listings:', error)
    return { data: [], total: 0, page, totalPages: 0 }
  }

  const total = count ?? 0
  return {
    data: (data as Record<string, unknown>[]) ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function createListing(
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const supabase = createAdminClient()

  const { data: listing, error } = await supabase
    .from('listings')
    .insert(data as ListingInsert)
    .select()
    .single()

  if (error || !listing) {
    throw new Error(`Failed to create listing: ${error?.message}`)
  }

  return listing as Record<string, unknown>
}

export async function updateListing(
  id: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const supabase = createAdminClient()

  const { data: listing, error } = await supabase
    .from('listings')
    .update(data as ListingUpdate)
    .eq('id', id)
    .select()
    .single()

  if (error || !listing) {
    throw new Error(`Failed to update listing: ${error?.message}`)
  }

  return listing as Record<string, unknown>
}

export async function deleteListing(id: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('listings').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete listing: ${error.message}`)
  }

  return true
}

// ── Products CRUD ──────────────────────────────────────────────────────────

export async function getAdminProducts(
  filters: AdminProductFilters = {}
): Promise<AdminPaginatedResult<Record<string, unknown>>> {
  const supabase = createAdminClient()
  const page = filters.page ?? 1
  const limit = filters.limit ?? 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('products')
    .select('*, brand:brands(name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters.search) {
    const sanitized = filters.search.replace(/[^a-zA-Z0-9\s@._-]/g, '')
    query = query.ilike('name', `%${sanitized}%`)
  }

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching admin products:', error)
    return { data: [], total: 0, page, totalPages: 0 }
  }

  const total = count ?? 0
  return {
    data: (data as Record<string, unknown>[]) ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function createProduct(
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const supabase = createAdminClient()

  const { data: product, error } = await supabase
    .from('products')
    .insert(data as ProductInsert)
    .select()
    .single()

  if (error || !product) {
    throw new Error(`Failed to create product: ${error?.message}`)
  }

  return product as Record<string, unknown>
}

export async function updateProduct(
  id: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const supabase = createAdminClient()

  const { data: product, error } = await supabase
    .from('products')
    .update(data as ProductUpdate)
    .eq('id', id)
    .select()
    .single()

  if (error || !product) {
    throw new Error(`Failed to update product: ${error?.message}`)
  }

  return product as Record<string, unknown>
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`)
  }

  return true
}

// ── Categories CRUD ────────────────────────────────────────────────────────

export async function getAdminCategories(): Promise<Record<string, unknown>[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return (data as Record<string, unknown>[]) ?? []
}

export async function createCategory(
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const supabase = createAdminClient()

  const { data: category, error } = await supabase
    .from('categories')
    .insert(data as CategoryInsert)
    .select()
    .single()

  if (error || !category) {
    throw new Error(`Failed to create category: ${error?.message}`)
  }

  return category as Record<string, unknown>
}

export async function updateCategory(
  id: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const supabase = createAdminClient()

  const { data: category, error } = await supabase
    .from('categories')
    .update(data as CategoryUpdate)
    .eq('id', id)
    .select()
    .single()

  if (error || !category) {
    throw new Error(`Failed to update category: ${error?.message}`)
  }

  return category as Record<string, unknown>
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`)
  }

  return true
}

// ── Order Update (admin) ───────────────────────────────────────────────────

export async function updateOrder(
  id: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const supabase = createAdminClient()

  const { data: order, error } = await supabase
    .from('orders')
    .update({ ...data, updated_at: new Date().toISOString() } as OrderUpdate)
    .eq('id', id)
    .select('*, profile:profiles(full_name, phone)')
    .single()

  if (error || !order) {
    throw new Error(`Failed to update order: ${error?.message}`)
  }

  return order as Record<string, unknown>
}

// ── Order Detail (admin) ──────────────────────────────────────────────────

export async function getAdminOrderDetail(id: string): Promise<{
  order: Record<string, unknown> | null
  items: Record<string, unknown>[]
  customer: Record<string, unknown> | null
}> {
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) {
    return { order: null, items: [], customer: null }
  }

  const { data: items } = await supabase
    .from('order_items')
    .select(
      '*, listing:listings(sku, product:products(name, brand:brands(name)))'
    )
    .eq('order_id', id)

  const { data: customer } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', order.user_id)
    .single()

  return {
    order: order as Record<string, unknown>,
    items: (items as Record<string, unknown>[]) ?? [],
    customer: (customer as Record<string, unknown>) ?? null,
  }
}

// ── Customers ──────────────────────────────────────────────────────────────

export async function getAdminCustomers(
  filters: AdminCustomerFilters = {}
): Promise<AdminPaginatedResult<Record<string, unknown>>> {
  const supabase = createAdminClient()
  const page = filters.page ?? 1
  const limit = filters.limit ?? 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters.role) {
    query = query.eq('role', filters.role as UserRole)
  }
  if (filters.search) {
    const sanitized = filters.search.replace(/[^a-zA-Z0-9\s@._-]/g, '')
    query = query.or(
      `full_name.ilike.%${sanitized}%,username.ilike.%${sanitized}%,phone.ilike.%${sanitized}%`
    )
  }

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching admin customers:', error)
    return { data: [], total: 0, page, totalPages: 0 }
  }

  const total = count ?? 0
  return {
    data: (data as Record<string, unknown>[]) ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getAdminCustomerDetail(id: string): Promise<{
  profile: Record<string, unknown> | null
  orders: Record<string, unknown>[]
  wishlist: Record<string, unknown>[]
}> {
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const { data: wishlist } = await supabase
    .from('wishlist')
    .select('*, product:products(name, brand:brands(name))')
    .eq('user_id', id)

  return {
    profile: (profile as Record<string, unknown>) ?? null,
    orders: (orders as Record<string, unknown>[]) ?? [],
    wishlist: (wishlist as Record<string, unknown>[]) ?? [],
  }
}

export async function updateUserRole(
  id: string,
  role: string
): Promise<Record<string, unknown>> {
  const supabase = createAdminClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({ role: role as UserRole })
    .eq('id', id)
    .select()
    .single()

  if (error || !profile) {
    throw new Error(`Failed to update user role: ${error?.message}`)
  }

  return profile as Record<string, unknown>
}

// ── Reviews ────────────────────────────────────────────────────────────────

export async function getAdminReviews(
  filters: AdminReviewFilters = {}
): Promise<AdminPaginatedResult<Record<string, unknown>>> {
  const supabase = createAdminClient()
  const page = filters.page ?? 1
  const limit = filters.limit ?? 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('reviews')
    .select(
      '*, product:products(name, brand:brands(name)), profile:profiles(full_name)',
      {
        count: 'exact',
      }
    )
    .order('created_at', { ascending: false })

  if (filters.rating) {
    query = query.eq('rating', filters.rating)
  }

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching admin reviews:', error)
    return { data: [], total: 0, page, totalPages: 0 }
  }

  const total = count ?? 0
  return {
    data: (data as Record<string, unknown>[]) ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('reviews').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete review: ${error.message}`)
  }

  return true
}

// ── Newsletter ─────────────────────────────────────────────────────────────

export async function getNewsletterSubscribers(
  filters: { page?: number; limit?: number } = {}
): Promise<AdminPaginatedResult<Record<string, unknown>>> {
  const supabase = createAdminClient()
  const page = filters.page ?? 1
  const limit = filters.limit ?? 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('subscribed_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching newsletter subscribers:', error)
    return { data: [], total: 0, page, totalPages: 0 }
  }

  const total = count ?? 0
  return {
    data: (data as Record<string, unknown>[]) ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function exportNewsletterCSV(): Promise<string> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('email, subscribed_at')
    .order('subscribed_at', { ascending: false })

  if (error) {
    console.error('Error exporting newsletter:', error)
    return 'email,subscribed_at'
  }

  const escapeCsvField = (val: unknown): string => {
    const str = String(val ?? '')
    if (/[,"\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  const rows = (data ?? []).map(
    (s: Record<string, unknown>) =>
      `${escapeCsvField(s.email)},${escapeCsvField(s.subscribed_at)}`
  )
  return ['email,subscribed_at', ...rows].join('\n')
}

// ── Sync Log ───────────────────────────────────────────────────────────────

export async function getSyncHistory(
  limit: number = 20
): Promise<Record<string, unknown>[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('admin_log')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching sync history:', error)
    return []
  }

  return (data as Record<string, unknown>[]) ?? []
}

export async function logSyncResult(input: {
  triggered_by: string
  status: string
  rows_synced: number
  errors?: Json
  started_at?: string
  completed_at?: string
}): Promise<Record<string, unknown>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('admin_log')
    .insert({
      triggered_by: input.triggered_by,
      status: input.status,
      rows_synced: input.rows_synced,
      errors: input.errors ?? ([] as unknown as Json),
      started_at: input.started_at ?? new Date().toISOString(),
      completed_at: input.completed_at ?? new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(`Failed to log sync result: ${error?.message}`)
  }

  return data as Record<string, unknown>
}

// ── Price Comparisons ──────────────────────────────────────────────────────

export async function getProductMinPrices(): Promise<Map<string, number>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('listings')
    .select('product_id, price_kes')
    .eq('status', 'active')
    .order('price_kes', { ascending: true })

  if (error || !data) {
    console.error('Error fetching product min prices:', error)
    return new Map()
  }

  const priceMap = new Map<string, number>()
  for (const row of data as { product_id: string; price_kes: number }[]) {
    if (!priceMap.has(row.product_id)) {
      priceMap.set(row.product_id, row.price_kes)
    }
  }
  return priceMap
}

export async function getPriceComparisons(
  filters: { productId?: string } = {}
): Promise<Record<string, unknown>[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('price_comparisons')
    .select('*, product:products(name, brand:brands(name))')
    .order('crawled_at', { ascending: false })

  if (filters.productId) {
    query = query.eq('product_id', filters.productId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching price comparisons:', error)
    return []
  }

  return (data as Record<string, unknown>[]) ?? []
}

export async function getLatestCrawlDate(): Promise<Date | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('price_comparisons')
    .select('crawled_at')
    .order('crawled_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null

  return new Date(data.crawled_at as string)
}

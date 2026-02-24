import { createClient } from '@lib/supabase/server'
import type { PaginationParams, PaginatedResult } from '@app-types/filters'

export type Review = {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string | null
  body: string | null
  verified_purchase: boolean
  created_at: string
}

export type ReviewStats = {
  averageRating: number
  totalReviews: number
  histogram: Record<1 | 2 | 3 | 4 | 5, number>
}

export async function getProductReviews(
  productId: string,
  pagination: PaginationParams
): Promise<PaginatedResult<Review>> {
  const supabase = await createClient()

  const from = (pagination.page - 1) * pagination.perPage
  const to = from + pagination.perPage - 1

  const query = supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching reviews:', error)
    return {
      data: [],
      total: 0,
      page: pagination.page,
      perPage: pagination.perPage,
      totalPages: 0,
    }
  }

  // Count query
  const { count } = (await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true } as never)
    .eq('product_id', productId)) as unknown as { count: number | null }

  const total = count ?? 0

  return {
    data: (data as unknown as Review[]) ?? [],
    total,
    page: pagination.page,
    perPage: pagination.perPage,
    totalPages: Math.ceil(total / pagination.perPage),
  }
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const emptyStats: ReviewStats = {
    averageRating: 0,
    totalReviews: 0,
    histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)

  if (error || !data) {
    console.error('Error fetching review stats:', error)
    return emptyStats
  }

  const reviews = data as unknown as Array<{ rating: number }>

  if (reviews.length === 0) {
    return emptyStats
  }

  const histogram: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  }

  let sum = 0
  let validCount = 0
  for (const review of reviews) {
    const rating = review.rating
    if (rating >= 1 && rating <= 5) {
      sum += rating
      validCount++
      histogram[rating as 1 | 2 | 3 | 4 | 5]++
    }
  }

  return {
    averageRating:
      validCount > 0 ? Math.round((sum / validCount) * 100) / 100 : 0,
    totalReviews: validCount,
    histogram,
  }
}

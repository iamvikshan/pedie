import type { ConditionGrade } from '@app-types/product'

export type SortOption = 'newest' | 'price-asc' | 'price-desc'

export interface ListingFilters {
  condition?: ConditionGrade[]
  storage?: string[]
  color?: string[]
  carrier?: string[]
  brand?: string[]
  priceMin?: number
  priceMax?: number
}

export interface PaginationParams {
  page: number
  perPage: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface AvailableFilters {
  conditions: ConditionGrade[]
  storages: string[]
  colors: string[]
  carriers: string[]
  brands: string[]
  priceRange: { min: number; max: number }
}

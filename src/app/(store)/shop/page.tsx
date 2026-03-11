import type {
  ListingFilters,
  PaginationParams,
  SortOption,
} from '@app-types/filters'
import type { ConditionGrade } from '@app-types/product'
import { ActiveFilters } from '@components/catalog/activeFilters'
import { FilterSidebar } from '@components/catalog/filterSidebar'
import { Pagination } from '@components/catalog/pagination'
import { ProductGrid } from '@components/catalog/productGrid'
import { SortDropdown } from '@components/catalog/sortDropdown'
import { Breadcrumbs } from '@components/ui/breadcrumbs'
import { getAvailableFilters, getFilteredListings } from '@data/listings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop All Products | Pedie',
  description:
    'Browse all refurbished electronics at Pedie — phones, laptops, tablets and more with warranty.',
}

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams

  // Parse search params
  const filters: ListingFilters = {}

  if (resolvedSearchParams.condition) {
    const allowedGrades: ConditionGrade[] = [
      'acceptable',
      'good',
      'excellent',
      'premium',
    ]
    const validGrades = resolvedSearchParams.condition
      .split(',')
      .filter((g): g is ConditionGrade =>
        allowedGrades.includes(g as ConditionGrade)
      )
    if (validGrades.length > 0) {
      filters.condition = validGrades
    }
  }
  if (resolvedSearchParams.brand) {
    filters.brand = resolvedSearchParams.brand.split(',')
  }
  if (resolvedSearchParams.storage) {
    filters.storage = resolvedSearchParams.storage.split(',')
  }
  if (resolvedSearchParams.color) {
    filters.color = resolvedSearchParams.color.split(',')
  }
  if (resolvedSearchParams.category) {
    filters.category = resolvedSearchParams.category.split(',')
  }
  if (resolvedSearchParams.priceMin) {
    const parsed = parseInt(resolvedSearchParams.priceMin, 10)
    if (Number.isFinite(parsed)) filters.priceMin = parsed
  }
  if (resolvedSearchParams.priceMax) {
    const parsed = parseInt(resolvedSearchParams.priceMax, 10)
    if (Number.isFinite(parsed)) filters.priceMax = parsed
  }

  const allowedSorts: SortOption[] = ['newest', 'price-asc', 'price-desc']
  const sort: SortOption = allowedSorts.includes(
    resolvedSearchParams.sort as SortOption
  )
    ? (resolvedSearchParams.sort as SortOption)
    : 'newest'

  const parsedPage = parseInt(resolvedSearchParams.page || '', 10)
  const pagination: PaginationParams = {
    page: Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1,
    perPage: 12,
  }

  // Fetch data — null categorySlug means all products
  const [availableFilters, paginatedResult] = await Promise.all([
    getAvailableFilters(null),
    getFilteredListings(null, filters, sort, pagination),
  ])

  return (
    <div className='w-full pedie-container py-8'>
      <Breadcrumbs segments={[]} />

      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-pedie-text'>
          Shop All Products
        </h1>
        <p className='text-pedie-text-muted mt-2'>
          Browse our full collection of refurbished electronics
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Sidebar */}
        <aside className='w-full lg:w-1/4 flex-shrink-0'>
          <FilterSidebar
            availableFilters={availableFilters}
            currentFilters={filters}
            categorySlug=''
          />
        </aside>

        {/* Main Content */}
        <main className='w-full lg:w-3/4'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
            <h2 className='text-xl font-semibold text-pedie-text'>
              {paginatedResult.total}{' '}
              {paginatedResult.total === 1 ? 'Result' : 'Results'}
            </h2>
            <SortDropdown currentSort={sort} categorySlug='' />
          </div>

          <ActiveFilters currentFilters={filters} categorySlug='' />

          <ProductGrid listings={paginatedResult.data} />

          <Pagination
            currentPage={paginatedResult.page}
            totalPages={paginatedResult.totalPages}
            categorySlug=''
          />
        </main>
      </div>
    </div>
  )
}

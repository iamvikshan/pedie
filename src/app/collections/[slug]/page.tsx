import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCategoryBySlug } from '@lib/data/categories'
import { getFilteredListings, getAvailableFilters } from '@lib/data/listings'
import type {
  ListingFilters,
  SortOption,
  PaginationParams,
} from '@app-types/filters'
import type { ConditionGrade } from '@app-types/product'

import { CollectionBanner } from '@components/catalog/collection-banner'
import { FilterSidebar } from '@components/catalog/filter-sidebar'
import { SortDropdown } from '@components/catalog/sort-dropdown'
import { ActiveFilters } from '@components/catalog/active-filters'
import { ProductGrid } from '@components/catalog/product-grid'
import { Pagination } from '@components/catalog/pagination'

interface CollectionPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return {
      title: 'Category Not Found | Pedie',
    }
  }

  return {
    title: `${category.name} | Pedie`,
    description:
      category.description ||
      `Browse our collection of ${category.name.toLowerCase()} at Pedie.`,
  }
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams

  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  // Parse search params
  const filters: ListingFilters = {}

  if (resolvedSearchParams.condition) {
    filters.condition = resolvedSearchParams.condition.split(
      ','
    ) as ConditionGrade[]
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
  if (resolvedSearchParams.carrier) {
    filters.carrier = resolvedSearchParams.carrier.split(',')
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

  // Fetch data
  const [availableFilters, paginatedResult] = await Promise.all([
    getAvailableFilters(slug),
    getFilteredListings(slug, filters, sort, pagination),
  ])

  return (
    <div className='container mx-auto px-4 py-8'>
      <CollectionBanner
        category={category}
        listingCount={paginatedResult.total}
      />

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Sidebar */}
        <aside className='w-full lg:w-1/4 flex-shrink-0'>
          <FilterSidebar
            availableFilters={availableFilters}
            currentFilters={filters}
            categorySlug={slug}
          />
        </aside>

        {/* Main Content */}
        <main className='w-full lg:w-3/4'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
            <h2 className='text-xl font-semibold text-pedie-text'>
              {paginatedResult.total}{' '}
              {paginatedResult.total === 1 ? 'Result' : 'Results'}
            </h2>
            <SortDropdown currentSort={sort} categorySlug={slug} />
          </div>

          <ActiveFilters currentFilters={filters} categorySlug={slug} />

          <ProductGrid listings={paginatedResult.data} />

          <Pagination
            currentPage={paginatedResult.page}
            totalPages={paginatedResult.totalPages}
            categorySlug={slug}
          />
        </main>
      </div>
    </div>
  )
}

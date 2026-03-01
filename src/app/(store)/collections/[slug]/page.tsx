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
import {
  collectionJsonLd,
  breadcrumbJsonLd,
  safeJsonLd,
} from '@lib/seo/structuredData'

import { CollectionBanner } from '@components/catalog/collectionBanner'
import { FilterSidebar } from '@components/catalog/filterSidebar'
import { SortDropdown } from '@components/catalog/sortDropdown'
import { ActiveFilters } from '@components/catalog/activeFilters'
import { ProductGrid } from '@components/catalog/productGrid'
import { Pagination } from '@components/catalog/pagination'
import { SITE_URL } from '@/config'

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
    title: category.name,
    description:
      category.description ||
      `Browse our collection of ${category.name.toLowerCase()} at Pedie.`,
    openGraph: {
      title: `${category.name} | Pedie Tech`,
      description:
        category.description ||
        `Browse our collection of ${category.name.toLowerCase()} at Pedie.`,
      images: category.image_url ? [category.image_url] : undefined,
    },
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
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(collectionJsonLd(category, paginatedResult.total)),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumbJsonLd([
              { name: 'Home', url: SITE_URL },
              {
                name: category.name,
                url: `${SITE_URL}/collections/${category.slug}`,
              },
            ])
          ),
        }}
      />
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
    </>
  )
}

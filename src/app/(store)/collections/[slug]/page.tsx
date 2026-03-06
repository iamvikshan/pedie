import type {
  ListingFilters,
  PaginationParams,
  SortOption,
} from '@app-types/filters'
import type { ConditionGrade } from '@app-types/product'
import { ActiveFilters } from '@components/catalog/activeFilters'
import { CollectionBanner } from '@components/catalog/collectionBanner'
import { FilterSidebar } from '@components/catalog/filterSidebar'
import { Pagination } from '@components/catalog/pagination'
import { ProductGrid } from '@components/catalog/productGrid'
import { SortDropdown } from '@components/catalog/sortDropdown'
import { Breadcrumbs } from '@components/ui/breadcrumbs'
import { getCategoryBySlug, getCategoryBreadcrumb } from '@data/categories'
import { getAvailableFilters, getFilteredListings } from '@data/listings'
import {
  breadcrumbJsonLd,
  collectionJsonLd,
  safeJsonLd,
} from '@lib/seo/structuredData'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
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
    return notFound()
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

  // Fetch data
  const [availableFilters, paginatedResult, breadcrumbTrail] =
    await Promise.all([
      getAvailableFilters(slug),
      getFilteredListings(slug, filters, sort, pagination),
      getCategoryBreadcrumb(slug),
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
              { name: 'Shop', url: `${SITE_URL}/shop` },
              {
                name: category.name,
                url: `${SITE_URL}/collections/${category.slug}`,
              },
            ])
          ),
        }}
      />
      <div className='w-full pedie-container py-8'>
        <Breadcrumbs
          segments={breadcrumbTrail.map(seg => ({
            name: seg.name,
            href: `/collections/${seg.slug}`,
          }))}
        />
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

import { ProductGrid } from '@components/catalog/productGrid'
import { FilterSidebar } from '@components/search/filterSidebar'
import { getAvailableFilters, searchListings } from '@data/search'
import type { ConditionGrade } from '@app-types/product'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const search = await searchParams
  const query = (Array.isArray(search.q) ? search.q[0] : search.q) || ''

  return {
    title: query ? `Search: ${query} | Pedie` : 'Search | Pedie',
  }
}

function toArray(val: string | string[] | undefined): string[] {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}

/** Build a search URL that preserves all active filter params */
function buildSearchUrl(
  search: { [key: string]: string | string[] | undefined },
  targetPage?: number
): string {
  const params = new URLSearchParams()
  const q = (Array.isArray(search.q) ? search.q[0] : search.q) || ''
  params.set('q', q)
  if (targetPage && targetPage > 1) params.set('page', String(targetPage))
  for (const key of ['condition', 'brand', 'storage']) {
    const vals = toArray(search[key])
    vals.forEach(v => params.append(key, v))
  }
  for (const key of ['priceMin', 'priceMax']) {
    const val = Array.isArray(search[key]) ? search[key]![0] : search[key]
    if (val) params.set(key, val as string)
  }
  return `/search?${params.toString()}`
}

export default async function SearchPage({ searchParams }: PageProps) {
  const search = await searchParams
  const query = (Array.isArray(search.q) ? search.q[0] : search.q) || ''
  const pageStr = Array.isArray(search.page) ? search.page[0] : search.page
  const parsedPage = parseInt(pageStr || '1', 10)
  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1

  if (!query) {
    return (
      <div className='w-full max-w-7xl mx-auto px-4 py-16'>
        <div className='flex flex-col items-center justify-center text-center'>
          <svg
            className='w-20 h-20 text-pedie-text-muted mb-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
          <h1 className='text-2xl font-bold text-pedie-text mb-2'>
            Search for refurbished devices
          </h1>
          <p className='text-pedie-text-muted max-w-md'>
            Find the best deals on quality refurbished phones, tablets, and
            more.
          </p>
        </div>
      </div>
    )
  }

  const results = await searchListings(
    query,
    {
      condition: toArray(search.condition) as ConditionGrade[],
      brand: toArray(search.brand),
      storage: toArray(search.storage),
      priceMin: search.priceMin
        ? Number(
            Array.isArray(search.priceMin)
              ? search.priceMin[0]
              : search.priceMin
          )
        : undefined,
      priceMax: search.priceMax
        ? Number(
            Array.isArray(search.priceMax)
              ? search.priceMax[0]
              : search.priceMax
          )
        : undefined,
    },
    { page, perPage: 12 }
  )

  const availableFilters = await getAvailableFilters(query)

  return (
    <div className='w-full max-w-7xl mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-pedie-text mb-1'>
          Search results for &lsquo;{query}&rsquo;
        </h1>
        <p className='text-pedie-text-muted'>
          {results.total} {results.total === 1 ? 'result' : 'results'} found
        </p>
      </div>

      <div className='flex gap-8'>
        <Suspense fallback={null}>
          <FilterSidebar filters={availableFilters} query={query} />
        </Suspense>

        <div className='flex-1 min-w-0'>
          {results.data.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 px-4 text-center bg-pedie-card rounded-xl border border-pedie-border'>
              <svg
                className='w-16 h-16 text-pedie-text-muted mb-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
              <h2 className='text-xl font-semibold text-pedie-text mb-2'>
                No results found for &lsquo;{query}&rsquo;
              </h2>
              <p className='text-pedie-text-muted max-w-md'>
                Try different keywords or browse our collections.
              </p>
            </div>
          ) : (
            <>
              <ProductGrid listings={results.data} />

              {results.totalPages > 1 && (
                <div className='flex items-center justify-center gap-2 mt-12'>
                  {page > 1 && (
                    <Link
                      href={buildSearchUrl(search, page - 1)}
                      className='inline-flex items-center justify-center rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm font-medium text-pedie-text hover:bg-pedie-border transition-colors'
                    >
                      Previous
                    </Link>
                  )}

                  {(() => {
                    const maxVisible = 5
                    const half = Math.floor(maxVisible / 2)
                    let start = Math.max(1, page - half)
                    const end = Math.min(
                      results.totalPages,
                      start + maxVisible - 1
                    )
                    if (end - start + 1 < maxVisible) {
                      start = Math.max(1, end - maxVisible + 1)
                    }
                    const pages: React.ReactNode[] = []
                    if (start > 1) {
                      pages.push(
                        <Link
                          key={1}
                          href={buildSearchUrl(search, 1)}
                          className='inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors border border-pedie-border bg-pedie-card text-pedie-text hover:bg-pedie-border'
                        >
                          1
                        </Link>
                      )
                      if (start > 2)
                        pages.push(
                          <span
                            key='start-ellipsis'
                            className='px-1 text-pedie-text-muted'
                          >
                            …
                          </span>
                        )
                    }
                    for (let p = start; p <= end; p++) {
                      pages.push(
                        <Link
                          key={p}
                          href={buildSearchUrl(search, p)}
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            p === page
                              ? 'bg-pedie-green text-white'
                              : 'border border-pedie-border bg-pedie-card text-pedie-text hover:bg-pedie-border'
                          }`}
                        >
                          {p}
                        </Link>
                      )
                    }
                    if (end < results.totalPages) {
                      if (end < results.totalPages - 1)
                        pages.push(
                          <span
                            key='end-ellipsis'
                            className='px-1 text-pedie-text-muted'
                          >
                            …
                          </span>
                        )
                      pages.push(
                        <Link
                          key={results.totalPages}
                          href={buildSearchUrl(search, results.totalPages)}
                          className='inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors border border-pedie-border bg-pedie-card text-pedie-text hover:bg-pedie-border'
                        >
                          {results.totalPages}
                        </Link>
                      )
                    }
                    return pages
                  })()}

                  {page < results.totalPages && (
                    <Link
                      href={buildSearchUrl(search, page + 1)}
                      className='inline-flex items-center justify-center rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm font-medium text-pedie-text hover:bg-pedie-border transition-colors'
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

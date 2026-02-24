import type { Metadata } from 'next'
import Link from 'next/link'
import { searchListings } from '@lib/data/search'
import { ProductGrid } from '@components/catalog/product-grid'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const search = await searchParams
  const query = search.q || ''

  return {
    title: query ? `Search: ${query} | Pedie` : 'Search | Pedie',
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const search = await searchParams
  const query = search.q || ''
  const parsedPage = parseInt(search.page || '1', 10)
  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1

  if (!query) {
    return (
      <div className='container mx-auto px-4 py-16'>
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

  const results = await searchListings(query, {}, { page, perPage: 12 })

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-pedie-text mb-1'>
          Search results for &lsquo;{query}&rsquo;
        </h1>
        <p className='text-pedie-text-muted'>
          {results.total} {results.total === 1 ? 'result' : 'results'} found
        </p>
      </div>

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
                  href={`/search?q=${encodeURIComponent(query)}${page > 2 ? `&page=${page - 1}` : ''}`}
                  className='inline-flex items-center justify-center rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm font-medium text-pedie-text hover:bg-pedie-border transition-colors'
                >
                  Previous
                </Link>
              )}

              {Array.from({ length: results.totalPages }, (_, i) => i + 1).map(
                p => (
                  <Link
                    key={p}
                    href={`/search?q=${encodeURIComponent(query)}${p > 1 ? `&page=${p}` : ''}`}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-pedie-green text-white'
                        : 'border border-pedie-border bg-pedie-card text-pedie-text hover:bg-pedie-border'
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}

              {page < results.totalPages && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
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
  )
}

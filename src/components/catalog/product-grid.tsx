import type { ListingWithProduct } from '@app-types/product'
import { ProductCard } from '@components/ui/product-card'

interface ProductGridProps {
  listings: ListingWithProduct[]
}

export function ProductGrid({ listings }: ProductGridProps) {
  if (listings.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 px-4 text-center bg-pedie-card rounded-xl border border-pedie-border'>
        <svg
          className='w-16 h-16 text-pedie-text-muted mb-4'
          fill='none'
          aria-hidden='true'
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
        <h3 className='text-xl font-semibold text-pedie-text mb-2'>
          No products found
        </h3>
        <p className='text-pedie-text-muted max-w-md'>
          We couldn&apos;t find any products matching your current filters. Try
          adjusting or clearing some filters to see more results.
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      {listings.map(listing => (
        <ProductCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}

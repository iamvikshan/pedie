'use client'

import type { ListingWithProduct } from '@app-types/product'
import { ProductCard } from '@components/ui/productCard'
import { TbSearch } from 'react-icons/tb'

interface ProductGridProps {
  listings: ListingWithProduct[]
}

export function ProductGrid({ listings }: ProductGridProps) {
  if (listings.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 px-4 text-center bg-pedie-card rounded-xl border border-pedie-border'>
        <TbSearch
          className='w-16 h-16 text-pedie-text-muted mb-4'
          aria-hidden='true'
        />
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
        <ProductCard key={listing.listing_id} listing={listing} />
      ))}
    </div>
  )
}

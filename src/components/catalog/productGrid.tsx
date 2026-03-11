'use client'

import type { ListingWithProduct } from '@app-types/product'
import { EmptyState } from '@components/ui/emptyState'
import { ProductCard } from '@components/ui/productCard'
import { TbSearch } from 'react-icons/tb'

interface ProductGridProps {
  listings: ListingWithProduct[]
}

export function ProductGrid({ listings }: ProductGridProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={TbSearch}
        title='No products found'
        description="We couldn't find any products matching your current filters. Try adjusting or clearing some filters to see more results."
      />
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

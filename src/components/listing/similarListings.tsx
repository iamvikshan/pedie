import type { ListingWithProduct } from '@app-types/product'
import { ProductCard } from '@components/ui/productCard'

interface SimilarListingsProps {
  listings: ListingWithProduct[]
}

export function SimilarListings({ listings }: SimilarListingsProps) {
  if (!listings || listings.length === 0) return null

  return (
    <section className='pb-12'>
      <h2 className='text-2xl font-bold text-pedie-text mb-6'>
        Similar Products
      </h2>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {listings.map(listing => (
          <ProductCard key={listing.listing_id} listing={listing} />
        ))}
      </div>
    </section>
  )
}

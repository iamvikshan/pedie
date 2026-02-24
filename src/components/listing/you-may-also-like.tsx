import type { ListingWithProduct } from '@app-types/product'
import { ProductCard } from '@components/ui/product-card'

interface YouMayAlsoLikeProps {
  listings: ListingWithProduct[]
}

export function YouMayAlsoLike({ listings }: YouMayAlsoLikeProps) {
  if (!listings || listings.length === 0) return null

  return (
    <section className='pb-12'>
      <h2 className='text-2xl font-bold text-pedie-text mb-6'>
        You May Also Like
      </h2>
      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className='flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-x-visible lg:pb-0'>
        {listings.map(listing => (
          <div
            key={listing.listing_id}
            className='min-w-[260px] flex-shrink-0 lg:min-w-0'
          >
            <ProductCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  )
}

import { ProductCard } from '@components/ui/productCard'
import { getDealsListings } from '@data/deals'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Deals | Pedie',
  description: 'Shop the best deals on refurbished electronics in Kenya.',
}

export default async function DealsPage() {
  const listings = await getDealsListings()

  return (
    <div className='w-full max-w-7xl mx-auto px-4 md:px-6 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl md:text-4xl font-bold text-pedie-text mb-2'>
          Deals
        </h1>
        <p className='text-pedie-text-muted'>
          Sale items first, sorted by biggest savings.
        </p>
      </div>

      {listings.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {listings.map(listing => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className='text-center py-16 bg-pedie-card rounded-xl border border-pedie-border'>
          <p className='text-pedie-text-muted text-lg'>
            No deals available right now. Check back soon!
          </p>
        </div>
      )}
    </div>
  )
}

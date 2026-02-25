import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getListingById, getSimilarListings } from '@lib/data/listings'
import { getProductReviews, getReviewStats } from '@lib/data/reviews'
import { formatKes, calculateDeposit } from '@lib/constants'

import { ImageGallery } from '@components/listing/image-gallery'
import { ListingInfo } from '@components/listing/listing-info'
import { PriceDisplay } from '@components/listing/price-display'
import { AddToCart } from '@components/listing/add-to-cart'
import { ProductSpecs } from '@components/listing/product-specs'
import { ProductDescription } from '@components/listing/product-description'
import { PreorderBadge } from '@components/listing/preorder-badge'
import { ShippingInfo } from '@components/listing/shipping-info'
import { SimilarListings } from '@components/listing/similar-listings'
import { CustomerReviews } from '@components/listing/customer-reviews'

type PageProps = {
  params: Promise<{ listingId: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { listingId } = await params
  const listing = await getListingById(listingId)

  if (!listing) {
    return { title: 'Listing Not Found | Pedie' }
  }

  return {
    title: `${listing.product.brand} ${listing.product.model} - ${listing.listing_id} | Pedie`,
    description: `Buy ${listing.product.brand} ${listing.product.model} (${listing.condition}) for ${formatKes(listing.price_kes)}`,
  }
}

export default async function ListingPage({ params }: PageProps) {
  const { listingId } = await params
  const listing = await getListingById(listingId)

  if (!listing) {
    notFound()
  }

  const { product } = listing
  const allImages = [
    ...(listing.images || []),
    ...(product.images || []),
  ].filter(Boolean)
  const deposit = calculateDeposit(listing.price_kes)

  const [similarListings, reviews, reviewStats] = await Promise.all([
    getSimilarListings(listing.product_id, listing.listing_id),
    getProductReviews(listing.product_id, { page: 1, perPage: 5 }),
    getReviewStats(listing.product_id),
  ])

  return (
    <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      {/* Above the fold: image + info */}
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        {/* Left column: Image Gallery */}
        <ImageGallery
          images={allImages}
          productName={`${product.brand} ${product.model}`}
        />

        {/* Right column: Listing Info */}
        <div className='flex flex-col gap-4'>
          <ListingInfo listing={listing} />

          <PriceDisplay
            priceKes={listing.price_kes}
            originalPriceKes={product.original_price_kes}
            isPreorder={listing.is_preorder}
          />

          <PreorderBadge
            isPreorder={listing.is_preorder}
            depositAmount={deposit}
          />

          <AddToCart listing={listing} />

          <ShippingInfo />
        </div>
      </div>

      {/* Below the fold: specs, description */}
      <div className='mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <ProductSpecs specs={product.specs} />
        <ProductDescription
          description={product.description}
          keyFeatures={product.key_features}
        />
      </div>

      {/* Below the fold: related & reviews */}
      <div className='mt-12'>
        <SimilarListings listings={similarListings} />
        <CustomerReviews
          reviews={reviews.data}
          stats={reviewStats}
          totalReviews={reviewStats.totalReviews}
        />
      </div>
    </main>
  )
}

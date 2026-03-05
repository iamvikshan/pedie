import { AddToCart } from '@components/listing/addToCart'
import { CustomerReviews } from '@components/listing/customerReviews'
import { ImageGallery } from '@components/listing/imageGallery'
import { ListingInfo } from '@components/listing/listingInfo'
import { PreorderBadge } from '@components/listing/preorderBadge'
import { PriceDisplay } from '@components/listing/priceDisplay'
import { ProductDescription } from '@components/listing/productDescription'
import { ProductSpecs } from '@components/listing/productSpecs'
import { ShippingInfo } from '@components/listing/shippingInfo'
import { SimilarListings } from '@components/listing/similarListings'
import VariantSelector from '@components/listing/variantSelector'
import BetterDealNudge from '@components/listing/betterDealNudge'
import { Breadcrumbs } from '@components/ui/breadcrumbs'
import { calculateDeposit, formatKes } from '@helpers'
import { getListingById } from '@data/listings'
import { getProductReviews, getReviewStats } from '@data/reviews'
import { findBetterDeal } from '@utils/products'
import { getProductFamilyBySlug, getRelatedListings } from '@data/products'
import { getCategoryBreadcrumb } from '@data/categories'
import Link from 'next/link'
import {
  breadcrumbJsonLd,
  productJsonLd,
  safeJsonLd,
} from '@lib/seo/structuredData'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL } from '@/config'

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

  const allImages = [
    ...(listing.images || []),
    ...(listing.product.images || []),
  ].filter(Boolean)

  return {
    title: `${listing.product.brand} ${listing.product.model} - ${listing.listing_id}`,
    description: `Buy ${listing.product.brand} ${listing.product.model} (${listing.condition}) for ${formatKes(listing.price_kes)}`,
    openGraph: {
      title: `${listing.product.brand} ${listing.product.model}`,
      description: `${listing.condition} condition - ${formatKes(listing.price_kes)}`,
      images: allImages.length > 0 ? [allImages[0]] : undefined,
    },
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

  const [similarListings, reviews, reviewStats, family] = await Promise.all([
    getRelatedListings(listing.product.category_id, listing.product_id),
    getProductReviews(listing.product_id, { page: 1, perPage: 5 }),
    getReviewStats(listing.product_id),
    getProductFamilyBySlug(listing.product.slug),
  ])

  const betterDeal = family ? findBetterDeal(listing, family.listings) : null
  const savings = betterDeal
    ? listing.final_price_kes - betterDeal.final_price_kes
    : 0

  const breadcrumbTrail = listing.product.category?.slug
    ? await getCategoryBreadcrumb(listing.product.category.slug)
    : []

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(productJsonLd(listing)),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumbJsonLd([
              { name: 'Home', url: SITE_URL },
              {
                name: listing.product.category?.name || 'Products',
                url: listing.product.category?.slug
                  ? `${SITE_URL}/collections/${listing.product.category.slug}`
                  : `${SITE_URL}/collections`,
              },
              {
                name: `${listing.product.brand} ${listing.product.model}`,
                url: `${SITE_URL}/listings/${listing.listing_id}`,
              },
            ])
          ),
        }}
      />
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <Breadcrumbs
          segments={[
            ...breadcrumbTrail.map(seg => ({
              name: seg.name,
              href: `/collections/${seg.slug}`,
            })),
            {
              name: `${product.brand} ${product.model}`,
              href: `/products/${product.slug}`,
            },
            { name: listing.listing_id },
          ]}
        />
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

            {family && (
              <>
                <VariantSelector
                  listings={family.listings}
                  selectedListing={listing}
                  disabled
                />
                <BetterDealNudge betterDeal={betterDeal} savings={savings} />
                <Link
                  href={`/products/${listing.product.slug}`}
                  className='text-sm text-pedie-green hover:underline'
                >
                  See all {family.variantCount} variants &rarr;
                </Link>
              </>
            )}

            <PriceDisplay
              priceKes={listing.price_kes}
              originalPriceKes={product.original_price_kes}
              isPreorder={listing.listing_type === 'preorder'}
            />

            <PreorderBadge
              isPreorder={listing.listing_type === 'preorder'}
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
    </>
  )
}

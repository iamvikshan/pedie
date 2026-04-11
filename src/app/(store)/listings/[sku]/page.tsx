import { AddToCart } from '@components/listing/addToCart'
import BetterDealNudge from '@components/listing/betterDealNudge'
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
import { Breadcrumbs } from '@components/ui/breadcrumbs'
import {
  getCategoryBreadcrumb,
  getPrimaryCategoryForProduct,
} from '@data/categories'
import { getListingBySku } from '@data/listings'
import { getProductFamilyBySlug, getRelatedListings } from '@data/products'
import { getProductReviews, getReviewStats } from '@data/reviews'
import { calculateDeposit, formatKes } from '@helpers'
import {
  breadcrumbJsonLd,
  productJsonLd,
  safeJsonLd,
} from '@lib/seo/structuredData'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SITE_URL } from '@/config'
import { findBetterDeal } from '@utils/products'

type PageProps = {
  params: Promise<{ sku: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { sku } = await params
  const listing = await getListingBySku(sku)

  if (!listing) {
    return { title: 'Listing Not Found | Pedie' }
  }

  const allImages = [
    ...(listing.images || []),
    ...(listing.product.images || []),
  ].filter(Boolean)
  const effectivePrice = listing.sale_price_kes ?? listing.price_kes

  return {
    title: `${listing.product.brand.name} ${listing.product.name} - ${listing.sku}`,
    description: `Buy ${listing.product.brand.name} ${listing.product.name} (${listing.condition}) for ${formatKes(effectivePrice)}`,
    openGraph: {
      title: `${listing.product.brand.name} ${listing.product.name}`,
      description: `${listing.condition} condition - ${formatKes(effectivePrice)}`,
      images: allImages.length > 0 ? [allImages[0]] : undefined,
    },
  }
}

export default async function ListingPage({ params }: PageProps) {
  const { sku } = await params
  const listing = await getListingBySku(sku)

  if (!listing) {
    return notFound()
  }

  const { product } = listing
  const productName = `${product.brand.name} ${product.name}`
  const effectivePrice = listing.sale_price_kes ?? listing.price_kes
  const allImages = [
    ...(listing.images || []),
    ...(product.images || []),
  ].filter(Boolean)
  const deposit = calculateDeposit(effectivePrice)

  const [similarListings, reviews, reviewStats, family, primaryCategory] =
    await Promise.all([
      getRelatedListings(listing.product_id),
      getProductReviews(listing.product_id, { page: 1, perPage: 5 }),
      getReviewStats(listing.product_id),
      getProductFamilyBySlug(listing.product.slug),
      getPrimaryCategoryForProduct(listing.product_id),
    ])

  const betterDeal = family ? findBetterDeal(listing, family.listings) : null
  const familyVariantCount = family?.variantCount ?? 0
  const savings = betterDeal
    ? effectivePrice - (betterDeal.sale_price_kes ?? betterDeal.price_kes)
    : 0

  const breadcrumbTrail = primaryCategory?.slug
    ? await getCategoryBreadcrumb(primaryCategory.slug)
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
              { name: 'Shop', url: `${SITE_URL}/shop` },
              {
                name: primaryCategory?.name || 'Products',
                url: primaryCategory?.slug
                  ? `${SITE_URL}/collections/${primaryCategory.slug}`
                  : `${SITE_URL}/collections`,
              },
              {
                name: productName,
                url: `${SITE_URL}/listings/${listing.sku}`,
              },
            ])
          ),
        }}
      />
      <section className='pedie-container py-8'>
        <Breadcrumbs
          segments={[
            ...breadcrumbTrail.map(seg => ({
              name: seg.name,
              href: `/collections/${seg.slug}`,
            })),
            {
              name: productName,
              href: `/products/${product.slug}`,
            },
            { name: listing.sku },
          ]}
        />
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          <ImageGallery images={allImages} productName={productName} />

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
                  See all {familyVariantCount} variants &rarr;
                </Link>
              </>
            )}

            <PriceDisplay
              priceKes={effectivePrice}
              originalPriceKes={
                listing.sale_price_kes != null ? listing.price_kes : null
              }
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

        <div className='mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2'>
          <ProductSpecs specs={product.specs} />
          <ProductDescription
            description={product.description}
            keyFeatures={product.key_features}
          />
        </div>

        <div className='mt-12'>
          <SimilarListings listings={similarListings} />
          <CustomerReviews
            reviews={reviews.data}
            stats={reviewStats}
            totalReviews={reviewStats.totalReviews}
          />
        </div>
      </section>
    </>
  )
}

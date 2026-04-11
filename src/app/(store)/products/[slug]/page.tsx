import { getProductFamilyBySlug, getRelatedListings } from '@data/products'
import {
  getCategoryBreadcrumb,
  getPrimaryCategoryForProduct,
} from '@data/categories'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { formatKes } from '@helpers'
import { Breadcrumbs } from '@components/ui/breadcrumbs'
import { ImageGallery } from '@components/listing/imageGallery'
import { ProductSpecs } from '@components/listing/productSpecs'
import { ProductDescription } from '@components/listing/productDescription'
import { SimilarListings } from '@components/listing/similarListings'
import ProductDetailClient from '@components/listing/productDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const productFamilyResult = await getProductFamilyBySlug(slug)
  if (!productFamilyResult) return { title: 'Product Not Found | Pedie' }

  const productFamily = productFamilyResult
  const product = productFamily.product
  const representative = productFamily.representative
  const effectivePrice =
    representative.sale_price_kes ?? representative.price_kes
  return {
    title: `${product.brand.name} ${product.name} | Pedie`,
    description: `Buy ${product.brand.name} ${product.name} from ${formatKes(effectivePrice)} — ${productFamily.variantCount} variants available`,
    openGraph: {
      title: `${product.brand.name} ${product.name}`,
      description: `From ${formatKes(effectivePrice)} — ${productFamily.variantCount} options`,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const productFamilyResult = await getProductFamilyBySlug(slug)

  if (!productFamilyResult) {
    return notFound()
  }

  const productFamily = productFamilyResult
  const product = productFamily.product

  const [relatedListings, primaryCategory] = await Promise.all([
    getRelatedListings(product.id),
    getPrimaryCategoryForProduct(product.id),
  ])

  const breadcrumbTrail = primaryCategory?.slug
    ? await getCategoryBreadcrumb(primaryCategory.slug)
    : []

  return (
    <section className='pedie-container py-8'>
      <Breadcrumbs
        segments={[
          ...breadcrumbTrail.map(seg => ({
            name: seg.name,
            href: `/collections/${seg.slug}`,
          })),
          { name: `${product.brand.name} ${product.name}` },
        ]}
      />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16'>
        {/* Left Column - Images */}
        <div>
          <ImageGallery
            images={product.images || []}
            productName={`${product.brand.name} ${product.name}`}
          />
        </div>

        {/* Right Column - Info */}
        <div className='flex flex-col gap-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight mb-2'>
              {product.brand.name} {product.name}
            </h1>
          </div>

          <ProductDetailClient family={productFamily} product={product} />
        </div>
      </div>

      {/* Below Fold - Details */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16'>
        <div className='lg:col-span-2 space-y-12'>
          {product.description && (
            <ProductDescription
              description={product.description}
              keyFeatures={product.key_features}
            />
          )}
          <ProductSpecs specs={product.specs} />
        </div>
      </div>

      {/**
       * @todo Implement CustomerReviews component here as part of the reviews system.
       * Requires: reviews data fetching, review stats aggregation, review submission form.
       * See: https://github.com/iamvikshan/pedie — reviews system milestone
       */}

      <SimilarListings listings={relatedListings} />
    </section>
  )
}

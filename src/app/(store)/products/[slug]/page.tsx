import { getProductFamilyBySlug } from '@lib/data/families'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { formatKes } from '@helpers'
import { ImageGallery } from '@components/listing/imageGallery'
import { ProductSpecs } from '@components/listing/productSpecs'
import { ProductDescription } from '@components/listing/productDescription'
import { SimilarListings } from '@components/listing/similarListings'
import { ConditionBadge } from '@components/ui/conditionBadge'
import ProductDetailClient from '@components/listing/productDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const family = await getProductFamilyBySlug(slug)
  if (!family) return { title: 'Product Not Found | Pedie' }

  const { product, representative } = family
  return {
    title: `${product.brand} ${product.model} | Pedie`,
    description: `Buy ${product.brand} ${product.model} from ${formatKes(representative.final_price_kes)} — ${family.variantCount} variants available`,
    openGraph: {
      title: `${product.brand} ${product.model}`,
      description: `From ${formatKes(representative.final_price_kes)} — ${family.variantCount} options`,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const family = await getProductFamilyBySlug(slug)

  if (!family) {
    notFound()
  }

  const { product, representative } = family

  return (
    <main className='container mx-auto px-4 py-8 max-w-7xl'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16'>
        {/* Left Column - Images */}
        <div>
          <ImageGallery
            images={product.images || []}
            productName={`${product.brand} ${product.model}`}
          />
        </div>

        {/* Right Column - Info */}
        <div className='flex flex-col gap-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight mb-2'>
              {product.brand} {product.model}
            </h1>
            <ConditionBadge condition={representative.condition} />
          </div>

          <ProductDetailClient family={family} product={product} />
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

      <SimilarListings listings={[]} />
    </main>
  )
}

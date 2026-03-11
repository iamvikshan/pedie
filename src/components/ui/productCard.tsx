import type { ListingWithProduct } from '@app-types/product'
import { Badge } from '@components/ui/badge'
import { calculateDiscount, formatKes } from '@helpers'
import Image from 'next/image'
import Link from 'next/link'
import {
  TbFlame,
  TbPhoto,
  TbExternalLink,
  TbBrandWhatsapp,
} from 'react-icons/tb'
import { ConditionBadge } from './conditionBadge'

export const PRODUCT_CARD_ICONS = [
  'TbPhoto',
  'TbFlame',
  'TbExternalLink',
  'TbBrandWhatsapp',
] as const

interface ProductCardProps {
  listing: ListingWithProduct
}

export function ProductCard({ listing }: ProductCardProps) {
  if (!listing.product) return null

  const { product } = listing
  const productName = product.name
  const isSale =
    listing.sale_price_kes != null && listing.sale_price_kes < listing.price_kes
  const effectivePrice = isSale ? listing.sale_price_kes! : listing.price_kes
  const discount =
    isSale && listing.sale_price_kes != null
      ? calculateDiscount(listing.price_kes, listing.sale_price_kes)
      : 0
  const imageUrl = listing.images?.[0] || product.images?.[0]
  const isAffiliate = listing.listing_type === 'affiliate' && listing.source_url
  const isReferral = listing.listing_type === 'referral'

  const CardWrapper = isAffiliate ? 'a' : Link
  const wrapperProps = isAffiliate
    ? {
        href: listing.source_url!,
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    : {
        href: `/listings/${listing.sku}`,
      }

  return (
    <CardWrapper
      {...wrapperProps}
      className='group flex flex-col glass rounded-lg shadow-sm overflow-hidden transition-colors duration-300 border border-pedie-border hover:border-pedie-green/30'
      aria-label={`View ${productName}`}
    >
      {/* Image Section */}
      <div className='relative aspect-[3/4] bg-pedie-surface w-full overflow-hidden'>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className='object-contain transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-pedie-text-muted'>
            <TbPhoto className='w-12 h-12' aria-hidden='true' />
          </div>
        )}

        {/* Top-left badges */}
        <div className='absolute top-2 left-2 flex flex-col gap-2'>
          {isAffiliate && (
            <Badge
              variant='default'
              size='lg'
              title='Sold by an external partner'
              className='glass gap-1 bg-pedie-surface/80 backdrop-blur-sm font-bold'
            >
              <TbExternalLink className='w-3.5 h-3.5' aria-hidden='true' />
              Partner
            </Badge>
          )}
          {isReferral && (
            <Badge
              variant='green'
              size='lg'
              title='Ask about this product on WhatsApp'
              className='glass gap-1 bg-pedie-green/20 backdrop-blur-sm font-bold'
            >
              <TbBrandWhatsapp className='w-3.5 h-3.5' aria-hidden='true' />
              Referral
            </Badge>
          )}
          {isSale ? (
            <Badge
              variant='discount'
              size='lg'
              className='glass gap-1 bg-pedie-discount/20 backdrop-blur-sm font-bold'
            >
              <TbFlame className='w-3.5 h-3.5' aria-hidden='true' />
              Flash Sale
            </Badge>
          ) : (
            !isAffiliate &&
            !isReferral && (
              <span className='glass backdrop-blur-sm rounded-full px-2 py-1'>
                <ConditionBadge condition={listing.condition} />
              </span>
            )
          )}
        </div>

        {/* Top-right badges */}
        <div className='absolute top-2 right-2 flex flex-col gap-1.5 items-end'>
          <Badge
            variant='default'
            size='lg'
            className='glass bg-pedie-surface/80 backdrop-blur-sm font-mono text-xs'
          >
            {listing.sku}
          </Badge>
          {isSale && (
            <ConditionBadge condition={listing.condition} variant='circle' />
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className='p-4 flex flex-col flex-grow'>
        <h3 className='text-sm font-semibold text-pedie-text mb-1 line-clamp-2'>
          {productName}
        </h3>

        {/* Pricing */}
        <div className='mt-auto pt-3 border-t border-pedie-border min-h-[60px]'>
          {isSale ? (
            <div className='flex flex-col'>
              <div className='flex items-baseline gap-2 flex-wrap'>
                <span className='text-base font-bold text-pedie-discount'>
                  {formatKes(effectivePrice)}
                </span>
                <Badge
                  variant='discount'
                  className='glass bg-pedie-discount/20 backdrop-blur-sm font-bold'
                >
                  -{discount}%
                </Badge>
              </div>
              <span className='text-sm text-pedie-text-muted line-through'>
                {formatKes(listing.price_kes)}
              </span>
            </div>
          ) : (
            <div className='flex flex-col'>
              <span className='text-base font-bold text-pedie-accent'>
                {formatKes(effectivePrice)}
              </span>
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  )
}

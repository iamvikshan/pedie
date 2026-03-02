import type { ListingWithProduct } from '@app-types/product'
import { calculateDiscount, formatKes, getPricingTier } from '@helpers'
import Image from 'next/image'
import Link from 'next/link'
import { TbFlame, TbPhoto } from 'react-icons/tb'
import { BatteryBadge } from './batteryBadge'
import { ConditionBadge } from './conditionBadge'

export const PRODUCT_CARD_ICONS = ['TbBolt', 'TbPhoto', 'TbFlame'] as const

interface ProductCardProps {
  listing: ListingWithProduct
}

export function ProductCard({ listing }: ProductCardProps) {
  if (!listing.product) return null

  const { product } = listing
  const productName = `${product.brand} ${product.model}`
  const tier = getPricingTier(
    listing.final_price_kes,
    listing.price_kes,
    listing.is_on_sale
  )
  const discount =
    tier !== 'normal'
      ? calculateDiscount(listing.price_kes, listing.final_price_kes)
      : 0
  const imageUrl = listing.images?.[0] || product.images?.[0]

  return (
    <Link
      href={`/listings/${listing.listing_id}`}
      className='group flex flex-col glass rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 border border-pedie-border hover:border-pedie-green/30'
      aria-label={`View ${productName}`}
    >
      {/* Image Section */}
      <div className='relative aspect-square bg-pedie-surface w-full overflow-hidden'>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-pedie-text-muted'>
            <TbPhoto className='w-12 h-12' aria-hidden='true' />
          </div>
        )}

        {/* Top-left badges */}
        <div className='absolute top-2 left-2 flex flex-col gap-2'>
          {tier === 'sale' ? (
            <span className='glass bg-pedie-discount/20 backdrop-blur-sm text-pedie-discount text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1'>
              <TbFlame className='w-3.5 h-3.5' aria-hidden='true' />
              Flash Sale
            </span>
          ) : (
            <span className='glass backdrop-blur-sm rounded-full px-2 py-1'>
              <ConditionBadge condition={listing.condition} />
            </span>
          )}
        </div>

        {/* Top-right badges */}
        <div className='absolute top-2 right-2 flex flex-col gap-1.5 items-end'>
          {tier === 'sale' && (
            <ConditionBadge condition={listing.condition} variant='circle' />
          )}
          {listing.battery_health != null && (
            <BatteryBadge batteryHealth={listing.battery_health} />
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className='p-4 flex flex-col flex-grow'>
        <h3 className='text-lg font-semibold text-pedie-text mb-1 line-clamp-2'>
          {productName}
        </h3>

        <div className='text-sm text-pedie-text-muted mb-3 flex flex-wrap gap-x-2'>
          {listing.storage && <span>{listing.storage}</span>}
          {listing.storage && listing.color && <span>•</span>}
          {listing.color && <span>{listing.color}</span>}
        </div>

        {/* Pricing — 3-tier logic */}
        <div className='mt-auto pt-3 border-t border-pedie-border'>
          {tier === 'sale' ? (
            <div className='flex items-baseline gap-2 flex-wrap'>
              <span className='text-sm text-pedie-text-muted line-through'>
                {formatKes(listing.price_kes)}
              </span>
              <span className='text-xl font-bold text-pedie-discount'>
                {formatKes(listing.final_price_kes)}
              </span>
              <span className='glass text-pedie-discount text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm'>
                -{discount}%
              </span>
            </div>
          ) : tier === 'discounted' ? (
            <div className='flex items-baseline gap-2 flex-wrap'>
              <span className='text-xl font-bold text-pedie-accent'>
                {formatKes(listing.final_price_kes)}
              </span>
              <span className='text-sm text-pedie-text-muted line-through'>
                {formatKes(listing.price_kes)}
              </span>
              <span className='glass text-pedie-discount text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm'>
                -{discount}%
              </span>
            </div>
          ) : (
            <div className='flex flex-col'>
              <span className='text-xl font-bold text-pedie-accent'>
                {formatKes(listing.final_price_kes)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

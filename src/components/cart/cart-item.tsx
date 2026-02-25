'use client'

import Image from 'next/image'
import type { ListingWithProduct } from '@app-types/product'
import { formatKes } from '@lib/constants'
import { useCartStore } from '@lib/cart/store'
import { ConditionBadge } from '@components/ui/condition-badge'

interface CartItemProps {
  listing: ListingWithProduct
}

export function CartItem({ listing }: CartItemProps) {
  const removeListing = useCartStore(s => s.removeListing)
  const { product } = listing
  const productName = `${product.brand} ${product.model}`
  const imageUrl = listing.images?.[0] || product.images?.[0]

  return (
    <div className='flex items-center gap-4 rounded-lg border border-pedie-border bg-pedie-card p-4'>
      {/* Image */}
      <div className='relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-md bg-pedie-dark'>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className='object-cover'
            sizes='60px'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-pedie-text-muted'>
            <svg
              className='h-6 w-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className='flex flex-1 flex-col gap-1'>
        <h3 className='text-sm font-semibold text-pedie-text'>{productName}</h3>
        <div className='flex flex-wrap items-center gap-2 text-xs text-pedie-text-muted'>
          <span className='rounded bg-pedie-dark px-1.5 py-0.5 font-mono'>
            {listing.listing_id}
          </span>
          <ConditionBadge condition={listing.condition} />
          {listing.storage && <span>{listing.storage}</span>}
          {listing.color && <span>{listing.color}</span>}
        </div>
        {listing.is_preorder && (
          <span className='text-xs font-medium text-yellow-400'>Preorder</span>
        )}
      </div>

      {/* Price */}
      <span className='text-sm font-bold text-pedie-accent'>
        {formatKes(listing.price_kes)}
      </span>

      {/* Remove */}
      <button
        onClick={() => removeListing(listing.listing_id)}
        className='flex-shrink-0 rounded p-1 text-pedie-text-muted hover:bg-pedie-card-hover hover:text-red-400 transition-colors'
        aria-label={`Remove ${productName} from cart`}
      >
        <svg
          className='h-5 w-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </button>
    </div>
  )
}

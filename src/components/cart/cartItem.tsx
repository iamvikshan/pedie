'use client'

import type { ListingWithProduct } from '@app-types/product'
import { ConditionBadge } from '@components/ui/conditionBadge'
import { formatKes } from '@helpers'
import { useCartStore } from '@lib/cart/store'
import Image from 'next/image'
import { TbPhoto, TbTrash } from 'react-icons/tb'

interface CartItemProps {
  listing: ListingWithProduct
}

export function CartItem({ listing }: CartItemProps) {
  const removeListing = useCartStore(s => s.removeListing)
  const { product } = listing
  const productName = `${product.brand.name} ${product.name}`
  const imageUrl = listing.images?.[0] || product.images?.[0]

  return (
    <div className='flex items-center gap-4 rounded-lg border border-pedie-border bg-pedie-card p-4'>
      {/* Image */}
      <div className='relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-md bg-pedie-sunken'>
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
            <TbPhoto className='h-6 w-6' aria-hidden='true' />
          </div>
        )}
      </div>

      {/* Details */}
      <div className='flex flex-1 flex-col gap-1'>
        <h3 className='text-sm font-semibold text-pedie-text'>{productName}</h3>
        <div className='flex flex-wrap items-center gap-2 text-xs text-pedie-text-muted'>
          <span className='rounded bg-pedie-sunken px-1.5 py-0.5 font-mono'>
            {listing.sku}
          </span>
          <ConditionBadge condition={listing.condition} />
          {listing.storage && <span>{listing.storage}</span>}
          {listing.color && <span>{listing.color}</span>}
        </div>
        {listing.listing_type === 'preorder' && (
          <span className='text-xs font-medium text-pedie-warning'>
            Preorder
          </span>
        )}
      </div>

      {/* Price */}
      <div className='flex flex-col items-end'>
        <span className='text-sm font-bold text-pedie-accent'>
          {formatKes(listing.sale_price_kes ?? listing.price_kes)}
        </span>
        {listing.sale_price_kes != null &&
          listing.sale_price_kes < listing.price_kes && (
            <span className='text-xs text-pedie-text-muted line-through'>
              {formatKes(listing.price_kes)}
            </span>
          )}
      </div>

      {/* Remove */}
      <button
        onClick={() => removeListing(listing.id)}
        className='flex-shrink-0 rounded p-1 text-pedie-text-muted hover:bg-pedie-card-hover hover:text-pedie-error transition-colors'
        aria-label={`Remove ${productName} from cart`}
      >
        <TbTrash className='h-5 w-5' aria-hidden='true' />
      </button>
    </div>
  )
}

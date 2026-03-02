'use client'

import type { ListingWithProduct } from '@app-types/product'
import { useAuth } from '@components/auth/authProvider'
import { calculateDiscount, formatKes } from '@helpers'
import { useCartStore } from '@lib/cart/store'
import { useWishlist } from '@lib/wishlist/useWishlist'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TbBolt,
  TbCheck,
  TbHeart,
  TbHeartFilled,
  TbPhoto,
  TbShoppingCartPlus,
} from 'react-icons/tb'
import { Button } from './button'
import { ConditionBadge } from './conditionBadge'

export const PRODUCT_CARD_ICONS = [
  'TbHeart',
  'TbHeartFilled',
  'TbBolt',
  'TbCheck',
  'TbShoppingCartPlus',
  'TbPhoto',
] as const

interface ProductCardProps {
  listing: ListingWithProduct
}

export function ProductCard({ listing }: ProductCardProps) {
  const addListing = useCartStore(s => s.addListing)
  const inCart = useCartStore(s => s.hasListing(listing.listing_id))
  const { user } = useAuth()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const router = useRouter()

  if (!listing.product) return null

  const { product } = listing
  const productName = `${product.brand} ${product.model}`
  const discount = calculateDiscount(
    product.original_price_kes,
    listing.price_kes
  )

  const imageUrl = listing.images?.[0] || product.images?.[0]
  const wishlisted = isWishlisted(listing.product.id)

  return (
    <div className='group relative flex flex-col glass rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 border border-pedie-border hover:border-pedie-green/30'>
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

        {/* Badges */}
        <div className='absolute top-2 left-2 flex flex-col gap-2'>
          <ConditionBadge condition={listing.condition} />
          {discount > 0 && (
            <span className='bg-pedie-discount text-white text-xs font-bold px-2 py-1 rounded'>
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Heart */}
        <button
          type='button'
          className='absolute top-2 right-2 z-10 p-1.5 rounded-full bg-pedie-dark/40 hover:bg-pedie-dark/60 transition-colors'
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            if (!user) {
              router.push('/auth/signin')
              return
            }
            toggleWishlist(listing.product.id)
          }}
          aria-label={
            wishlisted
              ? `Remove ${productName} from wishlist`
              : `Add ${productName} to wishlist`
          }
        >
          {wishlisted ? (
            <TbHeartFilled
              className='w-5 h-5 text-pedie-discount'
              aria-hidden='true'
            />
          ) : (
            <TbHeart
              className='w-5 h-5 text-white transition-colors'
              aria-hidden='true'
            />
          )}
        </button>
      </div>

      {/* Content Section */}
      <div className='p-4 flex flex-col flex-grow'>
        <div className='text-xs text-pedie-text-muted mb-1 flex justify-between items-center'>
          <span>{listing.listing_id}</span>
          {listing.battery_health != null && (
            <span className='flex items-center gap-1'>
              <TbBolt className='w-3 h-3' aria-hidden='true' />
              {listing.battery_health}%
            </span>
          )}
        </div>

        <h3 className='text-lg font-semibold text-pedie-text mb-1 line-clamp-2'>
          {productName}
        </h3>

        <div className='text-sm text-pedie-text-muted mb-3 flex flex-wrap gap-x-2'>
          {listing.storage && <span>{listing.storage}</span>}
          {listing.storage && listing.color && <span>•</span>}
          {listing.color && <span>{listing.color}</span>}
        </div>

        <div className='mt-auto pt-3 border-t border-pedie-border'>
          <div className='flex flex-col mb-3'>
            {discount > 0 && (
              <span className='text-sm text-pedie-text-muted line-through'>
                {formatKes(product.original_price_kes)}
              </span>
            )}
            <span className='text-xl font-bold text-pedie-accent'>
              {formatKes(listing.price_kes)}
            </span>
          </div>

          <Button
            className='w-full relative z-10'
            variant={inCart ? 'secondary' : 'primary'}
            disabled={inCart}
            onClick={e => {
              e.preventDefault()
              addListing(listing)
            }}
          >
            {inCart ? (
              <>
                <TbCheck className='mr-2 h-4 w-4' aria-hidden='true' />
                In Cart
              </>
            ) : (
              <>
                <TbShoppingCartPlus
                  className='mr-2 h-4 w-4'
                  aria-hidden='true'
                />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stretched link covers entire card — last child to paint on top */}
      <Link
        href={`/listings/${listing.listing_id}`}
        className='absolute inset-0 z-0'
        aria-label={`View ${productName}`}
      >
        <span className='sr-only'>View {productName}</span>
      </Link>
    </div>
  )
}

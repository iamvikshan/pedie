'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ListingWithProduct } from '@app-types/product'
import { formatKes, calculateDiscount } from '@lib/constants'
import { useCartStore } from '@lib/cart/store'
import { useWishlist } from '@lib/wishlist/use-wishlist'
import { useAuth } from '@components/auth/auth-provider'
import { ConditionBadge } from './condition-badge'
import { Button } from './button'

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

  // Use listing image if available, otherwise product image, otherwise null
  const imageUrl = listing.images?.[0] || product.images?.[0]

  return (
    <div className='group relative flex flex-col bg-pedie-card rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 border border-pedie-border hover:border-pedie-accent'>
      {/* Image Section */}
      <div className='relative aspect-square bg-pedie-dark w-full overflow-hidden'>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-pedie-text-muted'>
            <svg
              className='w-12 h-12'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
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
          className='absolute top-2 right-2 relative z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors'
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
            isWishlisted(listing.product.id)
              ? `Remove ${productName} from wishlist`
              : `Add ${productName} to wishlist`
          }
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              isWishlisted(listing.product.id)
                ? 'fill-red-500 text-red-500'
                : 'fill-none text-white'
            }`}
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
            />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className='p-4 flex flex-col flex-grow'>
        <div className='text-xs text-pedie-text-muted mb-1 flex justify-between items-center'>
          <span>{listing.listing_id}</span>
          {listing.battery_health != null && (
            <span className='flex items-center gap-1'>
              <svg
                className='w-3 h-3'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
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
                <svg
                  className='mr-2 h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                In Cart
              </>
            ) : (
              'Add to Cart'
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

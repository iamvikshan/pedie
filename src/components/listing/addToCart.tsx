'use client'

import type { ListingWithProduct } from '@app-types/product'
import { ReferralCta } from '@components/listing/referralCta'
import { Button } from '@components/ui/button'
import { useCartStore } from '@lib/cart/store'

interface AddToCartProps {
  listing: ListingWithProduct
}

export function AddToCart({ listing }: AddToCartProps) {
  const addListing = useCartStore(s => s.addListing)
  const inCart = useCartStore(s => s.hasListing(listing.listing_id))

  const handleClick = () => {
    addListing(listing)
  }

  if (listing.listing_type === 'referral') {
    return <ReferralCta listing={listing} />
  }

  if (listing.listing_type === 'affiliate' && listing.source_url) {
    return (
      <a
        href={listing.source_url}
        target='_blank'
        rel='noopener noreferrer'
        className='inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pedie-accent bg-pedie-green text-white hover:bg-pedie-green-dark h-11 px-8 text-lg w-full'
      >
        View on Partner Site &rarr;
      </a>
    )
  }

  if (listing.listing_type === 'affiliate') {
    return (
      <Button variant='secondary' size='lg' className='w-full' disabled>
        Unavailable
      </Button>
    )
  }

  if (listing.status === 'sold' || listing.status === 'reserved') {
    return (
      <Button variant='primary' size='lg' className='w-full' disabled>
        Sold Out
      </Button>
    )
  }

  if (inCart) {
    return (
      <Button variant='secondary' size='lg' className='w-full' disabled>
        <svg
          className='mr-2 h-5 w-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M5 13l4 4L19 7'
          />
        </svg>
        In Cart
      </Button>
    )
  }

  return (
    <Button
      variant='primary'
      size='lg'
      className='w-full'
      onClick={handleClick}
    >
      {listing.listing_type === 'preorder' ? 'Preorder Now' : 'Add to Cart'}
    </Button>
  )
}

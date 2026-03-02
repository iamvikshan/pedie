'use client'

import type { ListingWithProduct } from '@app-types/product'
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

  if (listing.is_sold) {
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
      {listing.is_preorder ? 'Preorder Now' : 'Add to Cart'}
    </Button>
  )
}

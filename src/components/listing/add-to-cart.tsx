'use client'

import { Button } from '@components/ui/button'

interface AddToCartProps {
  listingId: string
  isPreorder: boolean
  isSold: boolean
}

export function AddToCart({ listingId, isPreorder, isSold }: AddToCartProps) {
  const handleClick = () => {
    void listingId
    // TODO Phase 4: Implement cart functionality
  }

  return (
    <Button
      variant='primary'
      size='lg'
      className='w-full'
      disabled={isSold}
      onClick={handleClick}
    >
      {isSold ? 'Sold Out' : isPreorder ? 'Preorder Now' : 'Add to Cart'}
    </Button>
  )
}

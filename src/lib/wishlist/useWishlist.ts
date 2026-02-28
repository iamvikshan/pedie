'use client'

import { useWishlistContext } from '@components/wishlist/wishlistProvider'

export function useWishlist() {
  const {
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    productIds,
    loading,
  } = useWishlistContext()

  return {
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    wishlistCount: productIds.size,
    loading,
  }
}

import { useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ListingWithProduct } from '@app-types/product'
import { calculateDeposit } from '@helpers'

interface CartStore {
  items: ListingWithProduct[]
  addListing: (listing: ListingWithProduct) => void
  removeListing: (listingId: string) => void
  clearCart: () => void
  hasListing: (listingId: string) => boolean
  getTotal: () => number
  getDepositTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addListing: listing => {
        const { items } = get()
        if (items.some(item => item.listing_id === listing.listing_id)) return
        set({ items: [...items, listing] })
      },

      removeListing: listingId => {
        set({
          items: get().items.filter(item => item.listing_id !== listingId),
        })
      },

      clearCart: () => set({ items: [] }),

      hasListing: listingId =>
        get().items.some(item => item.listing_id === listingId),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price_kes, 0),

      getDepositTotal: () =>
        get()
          .items.filter(item => item.is_preorder)
          .reduce((sum, item) => sum + calculateDeposit(item.price_kes), 0),

      getItemCount: () => get().items.length,
    }),
    {
      name: 'pedie-cart',
      skipHydration: true,
    }
  )
)

// Hydration helper for client components.
// Pure read-only subscription — CartHydration component handles rehydrate().
export function useHasHydrated() {
  return useSyncExternalStore(
    callback => useCartStore.persist.onFinishHydration(callback),
    () => useCartStore.persist.hasHydrated(),
    () => false // server snapshot: always false
  )
}

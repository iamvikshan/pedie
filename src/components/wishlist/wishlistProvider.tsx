'use client'

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react'
import { useAuth } from '@components/auth/authProvider'

interface WishlistContextValue {
  productIds: Set<string>
  isWishlisted: (productId: string) => boolean
  toggleWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  loading: boolean
}

const WishlistContext = createContext<WishlistContextValue>({
  productIds: new Set(),
  isWishlisted: () => false,
  toggleWishlist: async () => {},
  removeFromWishlist: async () => {},
  loading: false,
})

export function useWishlistContext() {
  return useContext(WishlistContext)
}

async function fetchWishlistIds(): Promise<string[]> {
  try {
    const res = await fetch('/api/wishlist')
    if (!res.ok) return []
    const data = await res.json()
    if (data.items) {
      return data.items.map((item: { product_id: string }) => item.product_id)
    }
  } catch {
    // Silently fail — wishlist is a non-critical feature
  }
  return []
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [productIds, setProductIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  // Derive effective IDs: immediately empty when user is null
  const effectiveProductIds = useMemo(
    () => (user ? productIds : new Set<string>()),
    [user, productIds]
  )

  useEffect(() => {
    if (!user) {
      return
    }

    let cancelled = false

    startTransition(async () => {
      const ids = await fetchWishlistIds()
      if (!cancelled) {
        setProductIds(new Set(ids))
      }
    })

    return () => {
      cancelled = true
    }
  }, [user])

  const isWishlisted = useCallback(
    (productId: string) => effectiveProductIds.has(productId),
    [effectiveProductIds]
  )

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user) return

      const wasWishlisted = effectiveProductIds.has(productId)

      // Optimistic update
      setProductIds(prev => {
        const next = new Set(prev)
        if (wasWishlisted) {
          next.delete(productId)
        } else {
          next.add(productId)
        }
        return next
      })

      try {
        const res = await fetch('/api/wishlist', {
          method: wasWishlisted ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })

        if (!res.ok) {
          // Revert optimistic update on failure
          setProductIds(prev => {
            const next = new Set(prev)
            if (wasWishlisted) {
              next.add(productId)
            } else {
              next.delete(productId)
            }
            return next
          })
        }
      } catch {
        // Revert on network error
        setProductIds(prev => {
          const next = new Set(prev)
          if (wasWishlisted) {
            next.add(productId)
          } else {
            next.delete(productId)
          }
          return next
        })
      }
    },
    [user, effectiveProductIds]
  )

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!user) return

      // Optimistic remove
      setProductIds(prev => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })

      try {
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })

        if (!res.ok) {
          // Re-add on failure
          setProductIds(prev => {
            const next = new Set(prev)
            next.add(productId)
            return next
          })
        }
      } catch {
        // Re-add on network error
        setProductIds(prev => {
          const next = new Set(prev)
          next.add(productId)
          return next
        })
      }
    },
    [user]
  )

  return (
    <WishlistContext.Provider
      value={{
        productIds: effectiveProductIds,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        loading: isPending,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

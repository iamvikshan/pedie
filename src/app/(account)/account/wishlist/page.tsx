'use client'

import { useAuth } from '@components/auth/authProvider'
import { useWishlistContext } from '@components/wishlist/wishlistProvider'
import { formatKes } from '@helpers'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'

interface WishlistItem {
  id: string
  product_id: string
  created_at: string | null
  product: {
    id: string
    brand: string
    model: string
    images: string[] | null
    original_price_kes: number
  }
}

async function fetchWishlistItems(): Promise<WishlistItem[]> {
  try {
    const res = await fetch('/api/wishlist')
    if (!res.ok) {
      console.error(`Wishlist fetch failed: ${res.status} ${res.statusText}`)
      return []
    }
    const data = await res.json()
    return data.items ?? []
  } catch {
    return []
  }
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth()
  const { removeFromWishlist } = useWishlistContext()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isPending, startTransition] = useTransition()
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    if (authLoading || !user) return

    startTransition(async () => {
      const wishlistItems = await fetchWishlistItems()
      setItems(wishlistItems)
      setHasFetched(true)
    })
  }, [user, authLoading])

  const handleRemove = async (productId: string) => {
    const prev = items
    setItems(prev => prev.filter(item => item.product_id !== productId))
    try {
      await removeFromWishlist(productId)
    } catch {
      setItems(prev)
    }
  }

  const loading = authLoading || (isPending && !hasFetched)

  if (loading) {
    return (
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-pedie-text'>Wishlist</h1>
        <div className='rounded-lg border border-pedie-border bg-pedie-card p-8 text-center'>
          <p className='text-pedie-text-muted'>Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-pedie-text'>Wishlist</h1>
        <div className='rounded-lg border border-pedie-border bg-pedie-card p-8 text-center'>
          <p className='text-lg text-pedie-text-muted'>
            Sign in to view your wishlist
          </p>
          <Link
            href='/auth/signin'
            className='mt-4 inline-block text-sm text-pedie-green hover:underline'
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-pedie-text'>
        Wishlist{items.length > 0 && ` (${items.length})`}
      </h1>

      {items.length === 0 ? (
        <div className='rounded-lg border border-pedie-border bg-pedie-card p-8 text-center'>
          <svg
            className='mx-auto h-12 w-12 text-pedie-text-muted'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
            />
          </svg>
          <p className='mt-4 text-lg text-pedie-text-muted'>
            Your wishlist is empty
          </p>
          <p className='mt-2 text-sm text-pedie-text-muted'>
            Browse products and tap the heart icon to save your favorites.
          </p>
          <Link
            href='/collections'
            className='mt-4 inline-block text-sm text-pedie-green hover:underline'
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {items.map(item => {
            const imageUrl = item.product.images?.[0]
            const productName = `${item.product.brand} ${item.product.model}`

            return (
              <div
                key={item.id}
                className='flex gap-4 rounded-lg border border-pedie-border bg-pedie-card p-4'
              >
                {/* Product Image */}
                <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-pedie-dark'>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={productName}
                      fill
                      className='object-cover'
                      sizes='96px'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center text-pedie-text-muted'>
                      <svg
                        className='h-8 w-8'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
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
                </div>

                {/* Product Info */}
                <div className='flex flex-1 flex-col justify-between'>
                  <div>
                    <h3 className='font-semibold text-pedie-text'>
                      {productName}
                    </h3>
                    <p className='text-sm font-bold text-pedie-accent'>
                      {formatKes(item.product.original_price_kes)}
                    </p>
                  </div>

                  <button
                    type='button'
                    onClick={() => handleRemove(item.product_id)}
                    className='mt-2 self-start text-xs text-red-400 hover:text-red-300 transition-colors'
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

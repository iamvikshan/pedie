'use client'

import { CartItem } from '@components/cart/cartItem'
import { CartSummary } from '@components/cart/cartSummary'
import { Button } from '@components/ui/button'
import { useCartStore, useHasHydrated } from '@lib/cart/store'
import Link from 'next/link'
import { DEFAULT_COLLECTION_HREF } from '@/config'

export function CartPageClient() {
  const items = useCartStore(s => s.items)
  const hydrated = useHasHydrated()

  if (!hydrated) {
    return (
      <div className='mx-auto max-w-4xl px-4 py-8'>
        <h1 className='text-2xl font-bold text-pedie-text mb-6'>
          Shopping Cart
        </h1>
        <div className='animate-pulse space-y-4'>
          {[1, 2].map(i => (
            <div key={i} className='h-24 rounded-lg bg-pedie-card' />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className='mx-auto max-w-4xl px-4 py-16 text-center'>
        <h1 className='text-2xl font-bold text-pedie-text'>
          Your Cart is Empty
        </h1>
        <p className='mt-2 text-pedie-text-muted'>
          Browse our collection and add items to your cart.
        </p>
        <Link href={DEFAULT_COLLECTION_HREF}>
          <Button variant='primary' className='mt-6'>
            Browse Products
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <h1 className='text-2xl font-bold text-pedie-text mb-6'>
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className='grid gap-8 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-4'>
          {items.map(item => (
            <CartItem key={item.id} listing={item} />
          ))}
        </div>

        <div className='lg:col-span-1'>
          <CartSummary />
          <Link href='/checkout' className='block mt-4'>
            <Button variant='primary' className='w-full'>
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { formatKes } from '@helpers'
import { useCartStore } from '@lib/cart/store'
import Link from 'next/link'

export function CartSummary() {
  const items = useCartStore(s => s.items)
  const total = useCartStore(s => s.getTotal())
  const depositTotal = useCartStore(s => s.getDepositTotal())
  const hasPreorderItems = items.some(item => item.is_preorder)

  return (
    <div className='rounded-xl border border-pedie-border bg-pedie-card p-6'>
      <h2 className='mb-4 text-lg font-bold text-pedie-text'>Order Summary</h2>

      <div className='space-y-3 text-sm'>
        <div className='flex justify-between text-pedie-text'>
          <span>Subtotal</span>
          <span>{formatKes(total)}</span>
        </div>

        <div className='flex justify-between text-pedie-text'>
          <span>Shipping</span>
          <span className='text-pedie-green'>Free</span>
        </div>

        {hasPreorderItems && (
          <>
            <div className='border-t border-pedie-border pt-3'>
              <div className='flex justify-between text-yellow-400'>
                <span>Deposit Due Now</span>
                <span>{formatKes(depositTotal)}</span>
              </div>
              <div className='mt-1 flex justify-between text-pedie-text-muted'>
                <span>Balance on Delivery</span>
                <span>{formatKes(Math.max(0, total - depositTotal))}</span>
              </div>
            </div>
          </>
        )}

        <div className='border-t border-pedie-border pt-3'>
          <div className='flex justify-between text-base font-bold text-pedie-text'>
            <span>Total</span>
            <span>{formatKes(total)}</span>
          </div>
        </div>
      </div>

      <div className='mt-6 space-y-3'>
        <Link
          href='/checkout'
          className='flex w-full items-center justify-center rounded-md bg-pedie-green px-4 py-3 text-sm font-medium text-white hover:bg-pedie-green-dark transition-colors'
        >
          Proceed to Checkout
        </Link>

        <Link
          href='/'
          className='flex w-full items-center justify-center rounded-md border border-pedie-border px-4 py-2 text-sm font-medium text-pedie-text hover:bg-pedie-card-hover transition-colors'
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

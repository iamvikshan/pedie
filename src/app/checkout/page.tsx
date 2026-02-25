'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@lib/cart/store'
import { useAuth } from '@components/auth/auth-provider'
import { formatKes, calculateDeposit } from '@lib/constants'
import { CheckoutSteps } from '@components/checkout/checkout-steps'
import { ShippingForm } from '@components/checkout/shipping-form'
import type { ShippingData } from '@components/checkout/shipping-form'
import { PaymentSelector } from '@components/checkout/payment-selector'
import type { PaymentMethod } from '@components/checkout/payment-selector'
import { MpesaPayment } from '@components/checkout/mpesa-payment'
import { PaypalPayment } from '@components/checkout/paypal-payment'
import { Button } from '@components/ui/button'

const SHIPPING_FEE = 0 // Free shipping for now

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const items = useCartStore(s => s.items)
  const getTotal = useCartStore(s => s.getTotal)
  const getDepositTotal = useCartStore(s => s.getDepositTotal)
  const clearCart = useCartStore(s => s.clearCart)

  const [step, setStep] = useState(1)
  const [shipping, setShipping] = useState<ShippingData | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect unauthenticated users to sign in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?next=/checkout')
    }
  }, [user, loading, router])

  const subtotal = getTotal()
  const depositTotal = getDepositTotal()
  const total = subtotal + SHIPPING_FEE

  const handleShippingSubmit = useCallback((data: ShippingData) => {
    setShipping(data)
    setStep(2)
  }, [])

  const handleCreateOrder = useCallback(async () => {
    if (!shipping) return
    setIsSubmitting(true)
    setError(null)

    try {
      const orderItems = items.map(listing => ({
        listing_id: listing.id,
        unit_price_kes: listing.price_kes,
        deposit_kes: calculateDeposit(listing.price_kes),
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          subtotal,
          depositTotal,
          shippingFee: SHIPPING_FEE,
          shippingAddress: {
            full_name: shipping.fullName,
            phone: shipping.phone,
            street: shipping.address,
            city: shipping.city,
            county: shipping.county,
            postal_code: shipping.postalCode || undefined,
            country: 'Kenya',
            notes: shipping.notes || undefined,
          },
          paymentMethod,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create order')

      setOrderId(data.orderId)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }, [shipping, items, subtotal, depositTotal, paymentMethod])

  const handlePaymentSuccess = useCallback(
    (receipt: string) => {
      router.push(`/orders/${orderId}?receipt=${encodeURIComponent(receipt)}`)
      // Clear cart after navigation is initiated - React won't re-render before navigation
      setTimeout(() => clearCart(), 100)
    },
    [clearCart, router, orderId]
  )

  const handlePaymentError = useCallback((msg: string) => {
    setError(msg)
  }, [])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className='mx-auto max-w-2xl px-4 py-16 text-center'>
        <p className='text-pedie-text-muted'>Loading...</p>
      </div>
    )
  }

  // Don't render checkout if not authenticated (redirect is happening via useEffect)
  if (!user) {
    return (
      <div className='mx-auto max-w-2xl px-4 py-16 text-center'>
        <p className='text-pedie-text-muted'>Redirecting to sign in...</p>
      </div>
    )
  }

  if (items.length === 0 && !orderId) {
    return (
      <div className='mx-auto max-w-2xl px-4 py-16 text-center'>
        <h1 className='text-2xl font-bold text-pedie-text'>
          Your cart is empty
        </h1>
        <p className='mt-2 text-pedie-text-muted'>
          Add some items before checking out.
        </p>
        <Button
          variant='primary'
          className='mt-6'
          onClick={() => router.push('/collections')}
        >
          Browse Products
        </Button>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold text-pedie-text'>Checkout</h1>

      <CheckoutSteps currentStep={step} />

      {error && (
        <div className='mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400'>
          {error}
          <button onClick={() => setError(null)} className='ml-2 underline'>
            Dismiss
          </button>
        </div>
      )}

      {/* Order Summary Sidebar */}
      <div className='mb-8 rounded-lg border border-pedie-border bg-pedie-card p-4'>
        <h3 className='text-sm font-medium text-pedie-text-muted mb-2'>
          Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h3>
        <div className='space-y-1 text-sm'>
          <div className='flex justify-between text-pedie-text'>
            <span>Subtotal</span>
            <span>{formatKes(subtotal)}</span>
          </div>
          <div className='flex justify-between text-pedie-text'>
            <span>Shipping</span>
            <span>{SHIPPING_FEE === 0 ? 'Free' : formatKes(SHIPPING_FEE)}</span>
          </div>
          <div className='flex justify-between font-semibold text-pedie-text border-t border-pedie-border pt-1 mt-1'>
            <span>Total</span>
            <span>{formatKes(total)}</span>
          </div>
          <div className='flex justify-between text-pedie-green'>
            <span>Deposit Due Now</span>
            <span>{formatKes(depositTotal)}</span>
          </div>
        </div>
      </div>

      {/* Step 1: Shipping */}
      {step === 1 && (
        <ShippingForm
          onSubmit={handleShippingSubmit}
          initialData={
            shipping
              ? {
                  fullName: shipping.fullName,
                  phone: shipping.phone,
                  address: shipping.address,
                  city: shipping.city,
                  county: shipping.county,
                  postalCode: shipping.postalCode,
                  notes: shipping.notes,
                }
              : undefined
          }
        />
      )}

      {/* Step 2: Payment Method Selection */}
      {step === 2 && (
        <div className='space-y-6'>
          <PaymentSelector
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />

          <div className='flex gap-4'>
            <Button variant='secondary' onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant='primary'
              className='flex-1'
              onClick={handleCreateOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Order...' : 'Continue to Payment'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && orderId && (
        <div className='space-y-6'>
          <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
            <p className='text-sm text-pedie-text-muted'>
              Order{' '}
              <span className='font-mono text-pedie-text'>
                {orderId.slice(0, 8)}...
              </span>{' '}
              created. Complete your deposit payment below.
            </p>
          </div>

          {paymentMethod === 'mpesa' ? (
            <MpesaPayment
              amount={depositTotal}
              orderId={orderId}
              phone={shipping?.phone}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          ) : (
            <PaypalPayment
              amountKes={depositTotal}
              orderId={orderId}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}

          <Button
            variant='secondary'
            onClick={() => {
              setOrderId(null)
              setStep(2)
            }}
            className='w-full'
          >
            Change Payment Method
          </Button>
        </div>
      )}
    </div>
  )
}

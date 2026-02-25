'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@components/ui/button'
import { kesToUsd } from '@lib/utils/currency'

interface PaypalPaymentProps {
  amountKes: number
  orderId: string
  onSuccess: (paypalOrderId: string) => void
  onError: (message: string) => void
}

type PaymentStatus = 'idle' | 'creating' | 'redirecting' | 'failed'

export function PaypalPayment({
  amountKes,
  orderId,
  onSuccess,
  onError,
}: PaypalPaymentProps) {
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [message, setMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const handlePay = useCallback(async () => {
    setStatus('creating')
    setMessage('Creating PayPal order...')

    try {
      const res = await fetch('/api/payments/paypal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountKes, orderId }),
      })

      const data = await res.json()
      if (!res.ok)
        throw new Error(data.error || 'Failed to create PayPal order')

      if (data.approvalUrl) {
        setStatus('redirecting')
        setMessage('Redirecting to PayPal...')
        // Open PayPal in a popup
        const popup = window.open(
          data.approvalUrl,
          'paypal-checkout',
          'width=500,height=700,scrollbars=yes'
        )

        if (!popup) {
          // Fallback to redirect if popup blocked
          window.location.href = data.approvalUrl
          return
        }

        // Poll for popup closure
        timerRef.current = setInterval(async () => {
          if (popup.closed) {
            clearInterval(timerRef.current!)
            timerRef.current = null
            // Check payment status instead of capturing (redirect handler captures)
            try {
              const statusRes = await fetch(
                `/api/payments/paypal/status?paypalOrderId=${data.paypalOrderId}`
              )
              const statusData = await statusRes.json()
              if (statusData.status === 'COMPLETED') {
                setStatus('idle')
                onSuccess(data.paypalOrderId)
              } else if (statusData.status === 'APPROVED') {
                // Funds not yet captured — trigger capture
                try {
                  const captureRes = await fetch(
                    '/api/payments/paypal/capture',
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        paypalOrderId: data.paypalOrderId,
                      }),
                    }
                  )
                  const captureData = await captureRes.json()
                  if (captureData.status === 'COMPLETED') {
                    setStatus('idle')
                    onSuccess(data.paypalOrderId)
                  } else {
                    setStatus('failed')
                    const msg = 'Payment capture failed. Please try again.'
                    setMessage(msg)
                    onError(msg)
                  }
                } catch {
                  setStatus('failed')
                  const msg = 'Failed to capture payment'
                  setMessage(msg)
                  onError(msg)
                }
              } else {
                setStatus('failed')
                const msg = 'Payment was not completed. Please try again.'
                setMessage(msg)
                onError(msg)
              }
            } catch {
              setStatus('failed')
              const msg = 'Failed to verify payment status'
              setMessage(msg)
              onError(msg)
            }
          }
        }, 1000)
      } else {
        throw new Error('No PayPal approval URL received')
      }
    } catch (error) {
      setStatus('failed')
      const msg =
        error instanceof Error ? error.message : 'PayPal payment failed'
      setMessage(msg)
      onError(msg)
    }
  }, [amountKes, orderId, onSuccess, onError])

  const amountUsd = kesToUsd(amountKes)

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-pedie-text-muted'>Amount (USD)</span>
          <span className='text-lg font-semibold text-pedie-text'>
            ${amountUsd}
          </span>
        </div>
        <p className='mt-1 text-xs text-pedie-text-muted'>
          Converted from KES {amountKes.toLocaleString('en-KE')} at approximate
          rate
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            status === 'failed'
              ? 'bg-red-500/10 text-red-400'
              : 'bg-blue-500/10 text-blue-400'
          }`}
        >
          {(status === 'creating' || status === 'redirecting') && (
            <div className='flex items-center gap-2'>
              <svg
                className='h-4 w-4 animate-spin'
                viewBox='0 0 24 24'
                fill='none'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                />
              </svg>
              {message}
            </div>
          )}
          {status === 'failed' && message}
        </div>
      )}

      <Button
        variant='primary'
        className='w-full'
        onClick={handlePay}
        disabled={status === 'creating' || status === 'redirecting'}
      >
        {status === 'creating'
          ? 'Creating Order...'
          : status === 'redirecting'
            ? 'Opening PayPal...'
            : status === 'failed'
              ? 'Retry with PayPal'
              : `Pay $${amountUsd} with PayPal`}
      </Button>
    </div>
  )
}

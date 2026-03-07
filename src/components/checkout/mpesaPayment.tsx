'use client'

import { Alert } from '@components/ui/alert'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Spinner } from '@components/ui/spinner'
import { formatPhoneForDaraja } from '@lib/payments/mpesa'
import { useCallback, useEffect, useRef, useState } from 'react'

interface MpesaPaymentProps {
  amount: number
  orderId: string
  phone?: string
  onSuccess: (receipt: string) => void
  onError: (message: string) => void
}

type PaymentStatus = 'idle' | 'sending' | 'polling' | 'success' | 'failed'

export function MpesaPayment({
  amount,
  orderId,
  phone: initialPhone,
  onSuccess,
  onError,
}: MpesaPaymentProps) {
  const [phone, setPhone] = useState(initialPhone || '')
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [message, setMessage] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const checkoutIdRef = useRef<string>('')

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const handlePay = useCallback(async () => {
    if (!phone.trim()) {
      setMessage('Enter your M-Pesa phone number')
      return
    }

    setStatus('sending')
    setMessage('Sending STK Push to your phone...')

    try {
      const res = await fetch('/api/payments/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formatPhoneForDaraja(phone),
          amount,
          orderId,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'STK Push failed')

      checkoutIdRef.current = data.CheckoutRequestID
      setStatus('polling')
      setMessage('Check your phone and enter your M-Pesa PIN...')

      // Poll for status every 5 seconds, max 12 times (60s)
      let attempts = 0
      pollRef.current = setInterval(async () => {
        attempts++
        if (attempts > 12) {
          clearInterval(pollRef.current!)
          pollRef.current = null
          setStatus('failed')
          setMessage('Payment timed out. Please try again.')
          onError('Payment timed out')
          return
        }

        try {
          const statusRes = await fetch(
            `/api/payments/mpesa/status?checkoutRequestId=${checkoutIdRef.current}`
          )
          const statusData = await statusRes.json()

          if (statusData.ResultCode === '0' || statusData.ResultCode === 0) {
            clearInterval(pollRef.current!)
            pollRef.current = null
            setStatus('success')
            setMessage('Payment successful!')
            onSuccess(statusData.MpesaReceiptNumber || checkoutIdRef.current)
          } else if (
            statusData.ResultCode != null &&
            Number(statusData.ResultCode) !== 0
          ) {
            clearInterval(pollRef.current!)
            pollRef.current = null
            setStatus('failed')
            setMessage(statusData.ResultDesc || 'Payment failed')
            onError(statusData.ResultDesc || 'Payment failed')
          }
        } catch {
          // Continue polling on network errors
        }
      }, 5000)
    } catch (error) {
      setStatus('failed')
      setMessage(error instanceof Error ? error.message : 'Payment failed')
      onError(error instanceof Error ? error.message : 'Payment failed')
    }
  }, [phone, amount, orderId, onSuccess, onError])

  const messageVariant =
    status === 'success' ? 'success' : status === 'failed' ? 'error' : 'info'

  return (
    <div className='space-y-4'>
      <div>
        <label
          htmlFor='mpesa-phone'
          className='block text-sm font-medium text-pedie-text-muted mb-1'
        >
          M-Pesa Phone Number
        </label>
        <Input
          id='mpesa-phone'
          type='tel'
          placeholder='+254 7XX XXX XXX'
          value={phone}
          onChange={e => setPhone(e.target.value)}
          disabled={status !== 'idle' && status !== 'failed'}
        />
      </div>

      {message && (
        <Alert variant={messageVariant}>
          {status === 'polling' && (
            <div className='flex items-center gap-2'>
              <Spinner aria-hidden='true' size='sm' />
              {message}
            </div>
          )}
          {status !== 'polling' && message}
        </Alert>
      )}

      <Button
        variant='primary'
        className='w-full'
        onClick={handlePay}
        disabled={
          status === 'sending' || status === 'polling' || status === 'success'
        }
      >
        {status === 'sending'
          ? 'Sending...'
          : status === 'polling'
            ? 'Waiting for Payment...'
            : status === 'success'
              ? 'Paid ✓'
              : status === 'failed'
                ? 'Retry Payment'
                : `Pay KES ${amount.toLocaleString('en-KE')} with M-Pesa`}
      </Button>
    </div>
  )
}

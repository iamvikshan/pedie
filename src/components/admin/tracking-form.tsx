'use client'

import { useState } from 'react'

interface TrackingFormProps {
  orderId: string
  initialTracking?: Record<string, string> | null
  initialNotes?: string | null
}

export function TrackingForm({
  orderId,
  initialTracking,
  initialNotes,
}: TrackingFormProps) {
  const [carrier, setCarrier] = useState(initialTracking?.carrier ?? '')
  const [trackingNumber, setTrackingNumber] = useState(
    initialTracking?.tracking_number ?? ''
  )
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    initialTracking?.estimated_delivery ?? ''
  )
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const trackingInfo: Record<string, string> = {}
      if (carrier) trackingInfo.carrier = carrier
      if (trackingNumber) trackingInfo.tracking_number = trackingNumber
      if (estimatedDelivery) trackingInfo.estimated_delivery = estimatedDelivery

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_info: trackingInfo,
          notes: notes || undefined,
        }),
      })

      if (!res.ok) {
        let errorMessage = 'Failed to update tracking'
        try {
          const data = await res.json()
          errorMessage = data.error ?? errorMessage
        } catch {
          // Response was not JSON
        }
        throw new Error(errorMessage)
      }

      setMessage('Tracking information saved')
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error ? error.message : 'Failed to update tracking'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='rounded-lg border border-pedie-border bg-pedie-card p-4'
    >
      <h3 className='mb-3 font-medium text-pedie-text'>Tracking Information</h3>
      <div className='space-y-3'>
        <div>
          <label
            htmlFor='carrier'
            className='mb-1 block text-sm text-pedie-muted'
          >
            Carrier
          </label>
          <input
            id='carrier'
            type='text'
            value={carrier}
            onChange={e => setCarrier(e.target.value)}
            placeholder='e.g. DHL, FedEx'
            className='w-full rounded border border-pedie-border bg-pedie-bg px-3 py-2 text-sm text-pedie-text'
          />
        </div>
        <div>
          <label
            htmlFor='tracking-number'
            className='mb-1 block text-sm text-pedie-muted'
          >
            Tracking Number
          </label>
          <input
            id='tracking-number'
            type='text'
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            placeholder='Tracking number'
            className='w-full rounded border border-pedie-border bg-pedie-bg px-3 py-2 text-sm text-pedie-text'
          />
        </div>
        <div>
          <label
            htmlFor='estimated-delivery'
            className='mb-1 block text-sm text-pedie-muted'
          >
            Estimated Delivery
          </label>
          <input
            id='estimated-delivery'
            type='date'
            value={estimatedDelivery}
            onChange={e => setEstimatedDelivery(e.target.value)}
            className='w-full rounded border border-pedie-border bg-pedie-bg px-3 py-2 text-sm text-pedie-text'
          />
        </div>
        <div>
          <label
            htmlFor='notes'
            className='mb-1 block text-sm text-pedie-muted'
          >
            Notes
          </label>
          <textarea
            id='notes'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder='Internal notes'
            rows={3}
            className='w-full rounded border border-pedie-border bg-pedie-bg px-3 py-2 text-sm text-pedie-text'
          />
        </div>
        <button
          type='submit'
          disabled={loading}
          className='rounded bg-pedie-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50'
        >
          {loading ? 'Saving…' : 'Save Tracking'}
        </button>
        {message && (
          <p
            className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  )
}

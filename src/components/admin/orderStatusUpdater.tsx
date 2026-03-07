'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit() {
    if (status === currentStatus) return

    const confirmed = confirm(
      `Change order status from "${currentStatus}" to "${status}"?`
    )
    if (!confirmed) return

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to update status')
      }

      setMessage('Status updated successfully')
      router.refresh()
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Failed to update status'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
      <h3 className='mb-3 font-medium text-pedie-text'>Update Status</h3>
      <div className='flex items-center gap-3'>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          disabled={loading}
          className='rounded border border-pedie-border bg-pedie-bg px-3 py-2 text-sm text-pedie-text'
          aria-label='Order status'
        >
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={loading || status === currentStatus}
          className='rounded bg-pedie-green px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50'
        >
          {loading ? 'Updating…' : 'Update'}
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}

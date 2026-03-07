'use client'

import { Alert } from '@components/ui/alert'
import { Button } from '@components/ui/button'
import { Select } from '@components/ui/select'
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
  const [message, setMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)

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

      setMessage({ text: 'Status updated successfully', type: 'success' })
      router.refresh()
    } catch (error) {
      setMessage({
        text:
          error instanceof Error ? error.message : 'Failed to update status',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
      <h3 className='mb-3 font-medium text-pedie-text'>Update Status</h3>
      <div className='flex items-center gap-3'>
        <Select
          value={status}
          onChange={e => setStatus(e.target.value)}
          disabled={loading}
          className='w-auto bg-pedie-bg'
          aria-label='Order status'
        >
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
        <Button
          type='button'
          variant='primary'
          size='sm'
          onClick={handleSubmit}
          disabled={loading || status === currentStatus}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </div>
      {message && (
        <Alert variant={message.type} className='mt-2'>
          {message.text}
        </Alert>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CustomerRoleSwitcherProps {
  customerId: string
  currentRole: string
}

export function CustomerRoleSwitcher({
  customerId,
  currentRole,
}: CustomerRoleSwitcherProps) {
  const router = useRouter()
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)

  async function handleSubmit() {
    if (role === currentRole) return

    const confirmed = confirm(
      `Change user role from "${currentRole}" to "${role}"?`
    )
    if (!confirmed) return

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!res.ok) {
        let message = 'Failed to update role'
        try {
          const data = await res.json()
          message = data.error ?? 'Failed to update role'
        } catch {
          // Response was not JSON
        }
        throw new Error(message)
      }

      setMessage({ text: 'Role updated successfully', type: 'success' })
      router.refresh()
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Failed to update role',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
      <h3 className='mb-3 font-medium text-pedie-text'>Role Management</h3>
      <div className='flex items-center gap-3'>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          disabled={loading}
          className='rounded border border-pedie-border bg-pedie-bg px-3 py-2 text-sm text-pedie-text'
          aria-label='User role'
        >
          <option value='customer'>Customer</option>
          <option value='admin'>Admin</option>
        </select>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={loading || role === currentRole}
          className='rounded bg-pedie-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50'
        >
          {loading ? 'Updating…' : 'Update Role'}
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}

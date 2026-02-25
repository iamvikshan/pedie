'use client'

import { useState } from 'react'

export function SyncStatus() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    report?: { created: number; updated: number; errors: number }
    error?: string
  } | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' })
      let data
      try {
        data = await res.json()
      } catch {
        setResult({ error: 'Invalid response from server' })
        return
      }

      if (!res.ok) {
        setResult({ error: data.error ?? 'Sync failed' })
      } else {
        setResult({ success: true, report: data.report })
      }
    } catch {
      setResult({ error: 'Failed to connect to sync service' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='font-medium text-pedie-text'>Google Sheets Sync</h3>
          <p className='text-sm text-pedie-muted'>
            Sync product inventory from Google Sheets
          </p>
        </div>
        <button
          type='button'
          onClick={handleSync}
          disabled={loading}
          className='rounded bg-pedie-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50'
        >
          {loading ? 'Syncing…' : 'Sync Now'}
        </button>
      </div>

      {result && (
        <div className='mt-4'>
          {result.error ? (
            <div className='rounded bg-red-50 p-3 text-sm text-red-700'>
              {result.error}
            </div>
          ) : result.report ? (
            <div className='rounded bg-green-50 p-3 text-sm text-green-700'>
              <p>
                Sync completed: {result.report.created} created,{' '}
                {result.report.updated} updated, {result.report.errors} errors
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

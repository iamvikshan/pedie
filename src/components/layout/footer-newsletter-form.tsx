'use client'

import { useState } from 'react'
import { Button } from '@components/ui/button'

export function FooterNewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
        return
      }

      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className='flex flex-col gap-2 max-w-sm'>
      <h4 className='font-semibold text-pedie-text'>
        Subscribe to our newsletter
      </h4>
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <input
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='Enter your email'
          className='flex-1 rounded-md border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text placeholder:text-pedie-text-muted focus:border-pedie-green focus:outline-none'
          required
          disabled={status === 'loading' || status === 'success'}
        />
        <Button
          type='submit'
          size='sm'
          disabled={
            status === 'loading' || status === 'success' || status === 'error'
          }
        >
          {status === 'loading'
            ? '...'
            : status === 'success'
              ? '✓'
              : status === 'error'
                ? '✗'
                : 'Subscribe'}
        </Button>
      </form>
    </div>
  )
}

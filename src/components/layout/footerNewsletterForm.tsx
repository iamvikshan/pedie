'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@components/ui/button'

export function FooterNewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const scheduleReset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setStatus('idle'), 3000)
  }

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
        scheduleReset()
        return
      }

      setStatus('success')
      setEmail('')
      scheduleReset()
    } catch {
      setStatus('error')
      scheduleReset()
    }
  }

  return (
    <div className='flex flex-col gap-2 max-w-sm'>
      <h4 className='font-semibold text-pedie-text'>
        Subscribe to our newsletter
      </h4>
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <label htmlFor='footer-newsletter-email' className='sr-only'>
          Email address
        </label>
        <input
          id='footer-newsletter-email'
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
          disabled={status === 'loading' || status === 'success'}
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

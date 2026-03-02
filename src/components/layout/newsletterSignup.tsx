'use client'

import { Button } from '@components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { TbMail } from 'react-icons/tb'

export function NewsletterSignup() {
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
    <div className='rounded-xl bg-gradient-to-r from-pedie-green/20 to-pedie-green/5 border border-pedie-green/20 p-5'>
      <div className='flex items-center gap-2 mb-3'>
        <TbMail className='h-5 w-5 text-pedie-green' />
        <h4 className='font-semibold text-pedie-text'>Stay Updated</h4>
      </div>
      <p className='text-sm text-pedie-text-muted mb-4'>
        Get the latest deals and new arrivals in your inbox.
      </p>
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
          className='flex-1 rounded-md border border-pedie-border bg-pedie-surface px-3 py-2 text-sm text-pedie-text placeholder:text-pedie-text-muted focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green'
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
              ? '✓ Subscribed'
              : status === 'error'
                ? '✗ Retry'
                : 'Subscribe'}
        </Button>
      </form>
    </div>
  )
}

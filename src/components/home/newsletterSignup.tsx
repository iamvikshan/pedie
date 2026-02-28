'use client'

import { useState } from 'react'
import { Button } from '@components/ui/button'

export function NewsletterSignup() {
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
    <section className='py-16 container mx-auto px-4 md:px-6'>
      <div className='max-w-2xl mx-auto text-center bg-pedie-dark p-8 md:p-12 rounded-2xl border border-pedie-border'>
        <h2 className='text-2xl md:text-3xl font-bold text-pedie-text mb-4'>
          Stay Updated
        </h2>
        <p className='text-pedie-text-muted mb-8'>
          Subscribe to our newsletter to get the latest deals, new arrivals, and
          tech tips directly in your inbox.
        </p>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto'
        >
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='Enter your email address'
            required
            className='flex-1 rounded-md border border-pedie-border bg-pedie-card px-4 py-3 text-pedie-text placeholder:text-pedie-text-muted focus:border-pedie-green focus:outline-none'
            disabled={status === 'loading' || status === 'success'}
          />
          <Button
            type='submit'
            size='lg'
            disabled={status === 'loading' || status === 'success'}
            className='sm:w-auto w-full'
          >
            {status === 'loading'
              ? 'Subscribing...'
              : status === 'success'
                ? 'Subscribed!'
                : status === 'error'
                  ? 'Failed. Try again.'
                  : 'Subscribe'}
          </Button>
        </form>
      </div>
    </section>
  )
}

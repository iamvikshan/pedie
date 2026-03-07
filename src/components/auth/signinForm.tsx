'use client'

import { Button } from '@components/ui/button'
import { GoogleIcon } from '@components/ui/googleIcon'
import { createClient } from '@lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SignInFormProps {
  redirectTo?: string
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : error.message
      )
      setLoading(false)
      return
    }

    router.push(redirectTo || '/')
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo || '/')}`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Google Sign In */}
      <button
        onClick={handleGoogleSignIn}
        className='flex w-full items-center justify-center gap-3 rounded-lg border border-pedie-border bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors'
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className='flex items-center gap-4'>
        <div className='flex-1 border-t border-pedie-border' />
        <span className='text-xs text-pedie-text-muted'>or</span>
        <div className='flex-1 border-t border-pedie-border' />
      </div>

      {/* Email Sign In */}
      <form onSubmit={handleEmailSignIn} className='space-y-4'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-pedie-text mb-1'
          >
            Email
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className='w-full rounded-lg border border-pedie-border bg-pedie-card px-4 py-2.5 text-pedie-text placeholder:text-pedie-text-muted focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green'
            placeholder='you@example.com'
          />
        </div>
        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-pedie-text mb-1'
          >
            Password
          </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className='w-full rounded-lg border border-pedie-border bg-pedie-card px-4 py-2.5 text-pedie-text placeholder:text-pedie-text-muted focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green'
            placeholder='••••••••'
          />
        </div>

        {error && <p className='text-sm text-red-400'>{error}</p>}

        <Button
          type='submit'
          variant='primary'
          className='w-full'
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}

'use client'

import { Button } from '@components/ui/button'
import { createClient } from '@lib/supabase/client'
import { useState } from 'react'

interface SignUpFormProps {
  redirectTo?: string
}

export function SignUpForm({ redirectTo }: SignUpFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo || '/')}`,
      },
    })

    if (error) {
      // Handle account linking scenario
      if (error.message.includes('already registered')) {
        setError(
          'An account with this email already exists. Try signing in instead, or use Google if you signed up with Google.'
        )
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    if (loading) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo || '/')}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className='rounded-lg border border-pedie-green/30 bg-pedie-green/10 p-6 text-center'>
        <h2 className='text-lg font-semibold text-pedie-text'>
          Check your email
        </h2>
        <p className='mt-2 text-sm text-pedie-text-muted'>
          We&apos;ve sent a confirmation link to{' '}
          <strong className='text-pedie-text'>{email}</strong>. Click the link
          to activate your account.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Google Sign Up */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`flex w-full items-center justify-center gap-3 rounded-lg border border-pedie-border bg-white px-4 py-3 text-sm font-medium text-gray-900 transition-colors ${loading ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}
      >
        <svg width='20' height='20' viewBox='0 0 24 24' aria-hidden='true'>
          <path
            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z'
            fill='#4285F4'
          />
          <path
            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            fill='#34A853'
          />
          <path
            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            fill='#FBBC05'
          />
          <path
            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            fill='#EA4335'
          />
        </svg>
        Continue with Google
      </button>

      <div className='flex items-center gap-4'>
        <div className='flex-1 border-t border-pedie-border' />
        <span className='text-xs text-pedie-text-muted'>or</span>
        <div className='flex-1 border-t border-pedie-border' />
      </div>

      {/* Email Sign Up */}
      <form onSubmit={handleSignUp} className='space-y-4'>
        <div>
          <label
            htmlFor='fullName'
            className='block text-sm font-medium text-pedie-text mb-1'
          >
            Full Name
          </label>
          <input
            id='fullName'
            type='text'
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            className='w-full rounded-lg border border-pedie-border bg-pedie-card px-4 py-2.5 text-pedie-text placeholder:text-pedie-text-muted focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green'
            placeholder='John Doe'
          />
        </div>
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
            placeholder='Min. 6 characters'
          />
        </div>

        {error && <p className='text-sm text-red-400'>{error}</p>}

        <Button
          type='submit'
          variant='primary'
          className='w-full'
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </div>
  )
}

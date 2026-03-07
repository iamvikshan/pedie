'use client'

import { Alert } from '@components/ui/alert'
import { Button } from '@components/ui/button'
import { GoogleIcon } from '@components/ui/googleIcon'
import { Input } from '@components/ui/input'
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
      <Alert
        variant='success'
        className='border border-pedie-green/30 p-6 text-center'
      >
        <h2 className='text-lg font-semibold text-pedie-text'>
          Check your email
        </h2>
        <p className='mt-2 text-sm text-pedie-text-muted'>
          We&apos;ve sent a confirmation link to{' '}
          <strong className='text-pedie-text'>{email}</strong>. Click the link
          to activate your account.
        </p>
      </Alert>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Google Sign Up */}
      <Button
        onClick={handleGoogleSignIn}
        disabled={loading}
        variant='secondary'
        className='w-full gap-3 rounded-lg bg-white text-pedie-dark hover:bg-pedie-card-hover'
      >
        <GoogleIcon />
        Continue with Google
      </Button>

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
          <Input
            id='fullName'
            type='text'
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            placeholder='John Doe'
            size='lg'
          />
        </div>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-pedie-text mb-1'
          >
            Email
          </label>
          <Input
            id='email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder='you@example.com'
            size='lg'
          />
        </div>
        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-pedie-text mb-1'
          >
            Password
          </label>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder='Min. 6 characters'
            size='lg'
          />
        </div>

        {error && <Alert variant='error'>{error}</Alert>}

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

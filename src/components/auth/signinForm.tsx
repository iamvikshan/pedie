'use client'

import { Alert } from '@components/ui/alert'
import { Button } from '@components/ui/button'
import { GoogleIcon } from '@components/ui/googleIcon'
import { Input } from '@components/ui/input'
import { createClient } from '@lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SignInFormProps {
  redirectTo?: string
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let loginEmail = identifier.trim()

    if (!loginEmail.includes('@')) {
      try {
        const res = await fetch('/api/auth/resolve-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: loginEmail }),
        })
        if (!res.ok) {
          setError('Invalid username or password')
          setLoading(false)
          return
        }
        const data = await res.json()
        loginEmail = data.email
      } catch {
        setError('Invalid username or password')
        setLoading(false)
        return
      }
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Invalid username or password'
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
      <Button
        onClick={handleGoogleSignIn}
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

      {/* Email Sign In */}
      <form onSubmit={handleEmailSignIn} className='space-y-4'>
        <div>
          <label
            htmlFor='identifier'
            className='block text-sm font-medium text-pedie-text mb-1'
          >
            Username or email
          </label>
          <Input
            id='identifier'
            type='text'
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
            placeholder='you@example.com or username'
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
            placeholder='••••••••'
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
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}

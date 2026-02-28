import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@helpers/auth'
import { SignInForm } from '@components/auth/signinForm'

export const metadata: Metadata = {
  title: 'Sign In | Pedie Tech',
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const user = await getUser()
  if (user) {
    redirect('/')
  }

  const { next, error } = await searchParams

  return (
    <div className='mx-auto max-w-md px-4 py-16'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold text-pedie-text'>Welcome Back</h1>
        <p className='mt-2 text-pedie-text-muted'>
          Sign in to your Pedie Tech account
        </p>
      </div>

      {error && (
        <div className='mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400'>
          {error === 'auth_callback_failed'
            ? 'Authentication failed. Please try again.'
            : 'An error occurred. Please try again.'}
        </div>
      )}

      <SignInForm redirectTo={next} />

      <p className='mt-6 text-center text-sm text-pedie-text-muted'>
        Don&apos;t have an account?{' '}
        <a
          href={`/auth/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}
          className='text-pedie-green hover:underline'
        >
          Create one
        </a>
      </p>
    </div>
  )
}

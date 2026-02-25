import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@lib/auth/helpers'
import { SignUpForm } from '@components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Create Account | Pedie Tech',
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const user = await getUser()
  if (user) {
    redirect('/')
  }

  const { next } = await searchParams

  return (
    <div className='mx-auto max-w-md px-4 py-16'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold text-pedie-text'>Create Account</h1>
        <p className='mt-2 text-pedie-text-muted'>
          Join Pedie Tech for quality refurbished electronics
        </p>
      </div>

      <SignUpForm redirectTo={next} />

      <p className='mt-6 text-center text-sm text-pedie-text-muted'>
        Already have an account?{' '}
        <a
          href={`/auth/signin${next ? `?next=${encodeURIComponent(next)}` : ''}`}
          className='text-pedie-green hover:underline'
        >
          Sign in
        </a>
      </p>
    </div>
  )
}

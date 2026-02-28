import { describe, test, expect, mock } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

// Mock next/navigation
mock.module('next/navigation', () => ({
  useRouter: mock(() => ({
    push: mock(),
    replace: mock(),
    back: mock(),
    refresh: mock(),
  })),
  useSearchParams: mock(() => new URLSearchParams()),
  usePathname: mock(() => '/auth/signin'),
}))

// Mock supabase client
mock.module('@lib/supabase/client', () => ({
  createClient: mock(() => ({
    auth: {
      signInWithPassword: mock(() =>
        Promise.resolve({ data: null, error: null })
      ),
      signInWithOAuth: mock(() =>
        Promise.resolve({ data: null, error: null })
      ),
    },
  })),
}))

describe('SignInForm', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/auth/signinForm')
    expect(mod.SignInForm).toBeDefined()
    expect(typeof mod.SignInForm).toBe('function')
  })

  test('renders email and password fields', async () => {
    const { SignInForm } = await import('@components/auth/signinForm')
    const html = renderToString(<SignInForm />)

    expect(html).toContain('email')
    expect(html).toContain('password')
    expect(html).toContain('Email')
    expect(html).toContain('Password')
  })

  test('renders Google sign in button', async () => {
    const { SignInForm } = await import('@components/auth/signinForm')
    const html = renderToString(<SignInForm />)

    expect(html).toContain('Continue with Google')
  })

  test('renders sign in submit button', async () => {
    const { SignInForm } = await import('@components/auth/signinForm')
    const html = renderToString(<SignInForm />)

    expect(html).toContain('Sign In')
  })

  test('renders divider between OAuth and email form', async () => {
    const { SignInForm } = await import('@components/auth/signinForm')
    const html = renderToString(<SignInForm />)

    expect(html).toMatch(/text-pedie-text-muted">or<\/span>/)
  })

  test('renders placeholder text for inputs', async () => {
    const { SignInForm } = await import('@components/auth/signinForm')
    const html = renderToString(<SignInForm />)

    expect(html).toContain('you@example.com')
  })
})

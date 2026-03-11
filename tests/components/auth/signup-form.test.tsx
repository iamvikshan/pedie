import { describe, expect, mock, test } from 'bun:test'
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
  usePathname: mock(() => '/auth/signup'),
}))

// Mock supabase client
mock.module('@lib/supabase/client', () => ({
  createClient: mock(() => ({
    auth: {
      signUp: mock(() => Promise.resolve({ data: null, error: null })),
      signInWithOAuth: mock(() => Promise.resolve({ data: null, error: null })),
    },
  })),
}))

describe('SignUpForm', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/auth/signupForm')
    expect(mod.SignUpForm).toBeDefined()
    expect(typeof mod.SignUpForm).toBe('function')
  })

  test('renders username, email, and password fields', async () => {
    const { SignUpForm } = await import('@components/auth/signupForm')
    const html = renderToString(<SignUpForm />)

    expect(html).toContain('Username')
    expect(html).toContain('Email')
    expect(html).toContain('Password')
    expect(html).toContain('username')
    expect(html).toContain('email')
    expect(html).toContain('password')
  })

  test('renders Google sign up button', async () => {
    const { SignUpForm } = await import('@components/auth/signupForm')
    const html = renderToString(<SignUpForm />)

    expect(html).toContain('Continue with Google')
  })

  test('renders create account submit button', async () => {
    const { SignUpForm } = await import('@components/auth/signupForm')
    const html = renderToString(<SignUpForm />)

    expect(html).toContain('Create Account')
  })

  test('renders divider between OAuth and email form', async () => {
    const { SignUpForm } = await import('@components/auth/signupForm')
    const html = renderToString(<SignUpForm />)

    expect(html).toMatch(/text-pedie-text-muted">or<\/span>/)
  })

  test('renders placeholder text for inputs', async () => {
    const { SignUpForm } = await import('@components/auth/signupForm')
    const html = renderToString(<SignUpForm />)

    expect(html).toContain('you@example.com')
    expect(html).toContain('e.g. john_doe')
    expect(html).toContain('Min. 6 characters')
  })

  test('password input has minLength of 6', async () => {
    const { SignUpForm } = await import('@components/auth/signupForm')
    const html = renderToString(<SignUpForm />)

    expect(html).toContain('minLength="6"')
  })
})

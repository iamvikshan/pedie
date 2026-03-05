import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const src = readFileSync(
  resolve('src/components/layout/newsletterSignup.tsx'),
  'utf-8'
)

describe('NewsletterSignup (Footer)', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/newsletterSignup')
    expect(mod.NewsletterSignup).toBeDefined()
    expect(typeof mod.NewsletterSignup).toBe('function')
  })

  test('has email input field', () => {
    expect(src).toContain("type='email'")
    expect(src).toContain('placeholder')
    expect(src).toContain('Enter your email')
  })

  test('has subscribe button', () => {
    expect(src).toContain('Subscribe')
    expect(src).toContain("type='submit'")
  })

  test('has distinct gradient background', () => {
    expect(src).toContain('bg-gradient-to-r')
    expect(src).toContain('from-pedie-green/20')
    expect(src).toContain('to-pedie-green/5')
  })

  test('uses TbMail icon', () => {
    expect(src).toContain('TbMail')
  })

  test('has accessible label for email input', () => {
    expect(src).toContain('sr-only')
    expect(src).toContain('Email address')
  })

  test('posts to /api/newsletter', () => {
    expect(src).toContain('/api/newsletter')
    expect(src).toContain("method: 'POST'")
  })

  test('handles loading, success, and error states', () => {
    expect(src).toContain("'loading'")
    expect(src).toContain("'success'")
    expect(src).toContain("'error'")
    expect(src).toContain('Subscribed')
    expect(src).toContain('Retry')
  })
})

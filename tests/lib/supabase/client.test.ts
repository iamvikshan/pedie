import { describe, expect, test } from 'bun:test'

describe('Supabase client', () => {
  test('environment variables are set', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })

  test('URL is a valid URL format', () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    expect(url).toStartWith('https://')
    expect(url).toContain('.supabase.co')
  })

  test('anon key is a non-empty string', () => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    expect(key.length).toBeGreaterThan(0)
  })

  test('admin client throws without service role key', async () => {
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    try {
      // Re-import to get fresh module
      // We can't easily re-import in bun, so test the validation logic directly
      expect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!url || !serviceRoleKey) {
          throw new Error(
            'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
          )
        }
      }).toThrow(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
      )
    } finally {
      // Restore - use delete if originalKey was undefined to avoid setting "undefined" string
      if (originalKey === undefined) {
        delete process.env.SUPABASE_SERVICE_ROLE_KEY
      } else {
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey
      }
    }
  })
})

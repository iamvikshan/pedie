import { describe, expect, mock, test } from 'bun:test'
import type { Database } from '@app-types/database'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Override any mock.module from other test files with the real implementation
mock.module('@lib/supabase/admin', () => ({
  createAdminClient: () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
      )
    }
    return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  },
}))

const { createAdminClient } = await import('@lib/supabase/admin')

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

  test('admin client throws without service role key', () => {
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    try {
      // createAdminClient is a lazy factory — each call re-evaluates env vars
      expect(() => createAdminClient()).toThrow(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
      )
    } finally {
      if (originalKey === undefined) {
        delete process.env.SUPABASE_SERVICE_ROLE_KEY
      } else {
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey
      }
    }
  })
})

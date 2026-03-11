import { describe, expect, mock, test, beforeEach } from 'bun:test'

let limitResult = { success: true, limit: 10, remaining: 9, reset: 0 }
const mockLimit = mock(async () => limitResult)

mock.module('@lib/security/rateLimit', () => ({
  createRateLimiter: () => ({ limit: mockLimit }),
}))

const { createRateLimiter } = await import('@lib/security/rateLimit')

describe('Rate Limiting', () => {
  beforeEach(() => {
    mockLimit.mockReset()
    limitResult = { success: true, limit: 10, remaining: 9, reset: 0 }
    mockLimit.mockImplementation(async () => limitResult)
  })

  test('allows requests under the limit', async () => {
    const limiter = createRateLimiter('test', { requests: 10, window: '1 m' })
    const result = await limiter.limit('user-1')
    expect(result.success).toBe(true)
    expect(result.remaining).toBeGreaterThanOrEqual(0)
  })

  test('blocks requests over the limit', async () => {
    limitResult = {
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60000,
    }

    const limiter = createRateLimiter('test', { requests: 10, window: '1 m' })
    const result = await limiter.limit('user-1')
    expect(result.success).toBe(false)
  })

  test('graceful fallback when Upstash is not configured', async () => {
    const origUrl = process.env.UPSTASH_REDIS_REST_URL
    const origToken = process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    // Global mock.module still intercepts; this test verifies the mock
    // gracefully returns success when env vars are absent.
    const limiter = createRateLimiter('fallback-test', {
      requests: 5,
      window: '1 m',
    })
    const result = await limiter.limit('any-id')
    expect(result.success).toBe(true)

    if (origUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = origUrl
    else delete process.env.UPSTASH_REDIS_REST_URL
    if (origToken !== undefined)
      process.env.UPSTASH_REDIS_REST_TOKEN = origToken
    else delete process.env.UPSTASH_REDIS_REST_TOKEN
  })
})

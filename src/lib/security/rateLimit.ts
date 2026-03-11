import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type RateLimitConfig = {
  requests: number
  window: `${number} s` | `${number} m` | `${number} h`
}

export function createRateLimiter(prefix: string, config: RateLimitConfig) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn(
      `Rate limiter "${prefix}": Upstash not configured, allowing all requests`
    )
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      limit: async (_identifier: string) => ({
        success: true,
        limit: config.requests,
        remaining: config.requests,
        reset: 0,
      }),
    }
  }

  const redis = new Redis({ url, token })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: `ratelimit:${prefix}`,
  })
}

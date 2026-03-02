import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/config'
import type { CrawlerProduct, PriceResult } from './types'
/**
 * Fetch with exponential backoff retry.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  delay = 1000
): Promise<Response> {
  let lastError: Error | undefined
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': `Mozilla/5.0 (compatible; PedieCrawler/1.0; +${SITE_URL})`,
          ...options.headers,
        },
      })

      if (response.ok) {
        return response
      }

      // Don't retry client errors (4xx) except 429 (rate limited)
      if (response.status !== 429 && response.status < 500) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} for ${url}`
        )
      }

      // Retry on 429 or 5xx
      lastError = new Error(
        `HTTP ${response.status}: ${response.statusText} for ${url}`
      )
      console.error(
        `Attempt ${attempt + 1}/${maxRetries} failed with status ${response.status} for ${url}`
      )
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * 2 ** attempt))
      }
    } catch (error) {
      lastError = error as Error
      if (
        attempt < maxRetries - 1 &&
        !(
          lastError.message.startsWith('HTTP 4') &&
          !lastError.message.startsWith('HTTP 429')
        )
      ) {
        console.error(
          `Attempt ${attempt + 1}/${maxRetries} failed for ${url}:`,
          lastError.message
        )
        await new Promise(resolve => setTimeout(resolve, delay * 2 ** attempt))
      } else if (
        lastError.message.startsWith('HTTP 4') &&
        !lastError.message.startsWith('HTTP 429')
      ) {
        throw lastError
      }
    }
  }
  throw lastError!
}

/**
 * Parse KES price from text like "KES 45,000", "Ksh45000", "45,000".
 */
export function parseKesPrice(text: string): number | null {
  // Match patterns: KES 45,000 | Ksh 45,000 | Ksh45000 | 45,000 | 45000
  const match = text.match(
    /(?:KES|Ksh|KSh|Kshs?)\s*([\d,]+(?:\.\d+)?)|^([\d,]+(?:\.\d+)?)$/i
  )
  if (!match) return null

  const numStr = (match[1] || match[2]).replace(/,/g, '')
  const value = parseFloat(numStr)
  if (isNaN(value) || value <= 0) return null
  return Math.round(value)
}

/**
 * Parse USD price from text like "$499.99", "USD 499", "US$ 350".
 */
export function parseUsdPrice(text: string): number | null {
  const match = text.match(/(?:US\s*\$|\$|USD)\s*([\d,]+(?:\.\d+)?)/i)
  if (!match) return null

  const numStr = match[1].replace(/,/g, '')
  const value = parseFloat(numStr)
  if (isNaN(value) || value <= 0) return null
  return value
}

/**
 * Simple delay between requests for rate limiting.
 */
export async function rateLimiter(delayMs: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, delayMs))
}

/**
 * Create a Supabase client for crawler scripts (runs outside Next.js).
 */
export function createCrawlerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(url, key)
}

/**
 * Fetch all products that have at least one active listing.
 */
export async function getProductCatalog(
  supabase: SupabaseClient
): Promise<CrawlerProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, brand, model, slug, listings!inner(status)')
    .eq('listings.status', 'available')

  if (error) {
    console.error('Error fetching product catalog:', error.message)
    return []
  }

  return (data ?? []).map(
    (p: Record<string, unknown>) =>
      ({
        id: p.id as string,
        brand: p.brand as string,
        model: p.model as string,
        slug: p.slug as string,
      }) satisfies CrawlerProduct
  )
}

/**
 * Upsert price comparison results into the database.
 */
export async function upsertPriceComparisons(
  supabase: SupabaseClient,
  comparisons: PriceResult[]
): Promise<void> {
  if (comparisons.length === 0) return

  const { error } = await supabase.from('price_comparisons').upsert(
    comparisons.map(c => ({
      product_id: c.product_id,
      competitor: c.competitor,
      competitor_price_kes: c.competitor_price_kes,
      url: c.url,
      crawled_at: c.crawled_at,
    })),
    { onConflict: 'product_id,competitor,crawled_at' }
  )

  if (error) {
    console.error('Error upserting price comparisons:', error.message)
    throw error
  }
}

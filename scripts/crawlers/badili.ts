import * as cheerio from 'cheerio'
import { fetchWithRetry, parseKesPrice, rateLimiter } from './utils'
import type { CrawlerProduct, PriceResult } from './types'

const BADILI_BASE_URL = 'https://badili.ke'

interface BadiliParseResult {
  price_kes: number
  url: string
}

/**
 * Parse a Badili search results page and extract prices + URLs.
 */
export function parseBadiliPage(html: string): BadiliParseResult[] {
  const $ = cheerio.load(html)
  const results: BadiliParseResult[] = []

  $('.product-card').each((_, el) => {
    const priceText = $(el).find('.product-price').text().trim()
    const linkEl = $(el).find('a[href*="/product/"]')
    const href = linkEl.attr('href') ?? ''

    if (!href) return

    const price = parseKesPrice(priceText)
    if (price !== null) {
      results.push({
        price_kes: price,
        url: href.startsWith('http') ? href : `${BADILI_BASE_URL}${href}`,
      })
    }
  })

  return results
}

/**
 * Crawl Badili for prices matching the given products.
 */
export async function crawlBadili(
  products: CrawlerProduct[]
): Promise<PriceResult[]> {
  const results: PriceResult[] = []

  for (const product of products) {
    try {
      const now = new Date().toISOString()
      const searchQuery = encodeURIComponent(
        `${product.brand} ${product.model}`
      )
      const url = `${BADILI_BASE_URL}/search?q=${searchQuery}`

      const response = await fetchWithRetry(url)
      const html = await response.text()
      const parsed = parseBadiliPage(html)

      if (parsed.length > 0) {
        // Take the first (best match) result
        results.push({
          product_id: product.id,
          competitor: 'badili',
          competitor_price_kes: parsed[0].price_kes,
          url: parsed[0].url,
          crawled_at: now,
        })
      }
    } catch (error) {
      console.error(
        `Error crawling Badili for ${product.brand} ${product.model}:`,
        error
      )
    } finally {
      await rateLimiter(1500)
    }
  }

  return results
}

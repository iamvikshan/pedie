import * as cheerio from 'cheerio'
import { KES_USD_RATE } from '../../src/config'
import type { CrawlerProduct, PriceResult } from './types'
import { fetchWithRetry, parseUsdPrice, rateLimiter } from './utils'

const SWAPPA_BASE_URL = 'https://swappa.com'

interface SwappaParseResult {
  price_kes: number
  url: string
}

/**
 * Parse a Swappa listings page and extract USD prices converted to KES.
 */
export function parseSwappaPage(html: string): SwappaParseResult[] {
  const $ = cheerio.load(html)
  const results: SwappaParseResult[] = []

  $('.listing_row').each((_, el) => {
    const priceText = $(el).find('.price').text().trim()
    const linkEl = $(el).find('a[href*="/listing/"]')
    const href = linkEl.attr('href') || ''

    const priceUsd = parseUsdPrice(priceText)
    if (priceUsd !== null) {
      results.push({
        price_kes: Math.round(priceUsd * KES_USD_RATE),
        url: href.startsWith('http') ? href : `${SWAPPA_BASE_URL}${href}`,
      })
    }
  })

  return results
}

/**
 * Crawl Swappa for prices matching the given products.
 */
export async function crawlSwappa(
  products: CrawlerProduct[]
): Promise<PriceResult[]> {
  const results: PriceResult[] = []
  const now = new Date().toISOString()

  for (const product of products) {
    try {
      const searchQuery = encodeURIComponent(
        `${product.brand} ${product.model}`
      )
      const url = `${SWAPPA_BASE_URL}/search?q=${searchQuery}`

      const response = await fetchWithRetry(url)
      const html = await response.text()
      const parsed = parseSwappaPage(html)

      if (parsed.length > 0) {
        results.push({
          product_id: product.id,
          competitor: 'swappa',
          competitor_price_kes: parsed[0].price_kes,
          url: parsed[0].url,
          crawled_at: now,
        })
      }

      await rateLimiter(2000)
    } catch (error) {
      console.error(
        `Error crawling Swappa for ${product.brand} ${product.model}:`,
        error
      )
    }
  }

  return results
}

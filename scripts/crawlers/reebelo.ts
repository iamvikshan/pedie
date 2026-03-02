import * as cheerio from 'cheerio'
import { KES_USD_RATE } from '../../src/config'
import type { CrawlerProduct, PriceResult } from './types'
import { fetchWithRetry, parseUsdPrice, rateLimiter } from './utils'

const REEBELO_BASE_URL = 'https://www.reebelo.com'

interface ReebeloParseResult {
  price_kes: number
  url: string
}

/**
 * Parse a Reebelo search results page and extract USD prices converted to KES.
 */
export function parseReebeloPage(html: string): ReebeloParseResult[] {
  const $ = cheerio.load(html)
  const results: ReebeloParseResult[] = []

  // Reebelo uses product card divs with data-testid or class-based selectors
  $('[data-testid="product-card"], .product-card, .product-item').each(
    (_, el) => {
      const priceText = $(el)
        .find('[data-testid="product-price"], .product-price')
        .text()
        .trim()
      const linkEl = $(el).find('a[href]').first()
      const href = linkEl.attr('href') ?? ''

      if (!href) return

      const priceUsd = parseUsdPrice(priceText)
      if (priceUsd !== null) {
        results.push({
          price_kes: Math.round(priceUsd * KES_USD_RATE),
          url: href.startsWith('http') ? href : `${REEBELO_BASE_URL}${href}`,
        })
      }
    }
  )

  return results
}

/**
 * Crawl Reebelo for prices matching the given products.
 */
export async function crawlReebelo(
  products: CrawlerProduct[]
): Promise<PriceResult[]> {
  const results: PriceResult[] = []
  const now = new Date().toISOString()

  for (const product of products) {
    try {
      const searchQuery = encodeURIComponent(
        `${product.brand} ${product.model}`
      )
      const url = `${REEBELO_BASE_URL}/search?q=${searchQuery}`

      const response = await fetchWithRetry(url)
      const html = await response.text()
      const parsed = parseReebeloPage(html)

      if (parsed.length > 0) {
        results.push({
          product_id: product.id,
          competitor: 'reebelo',
          competitor_price_kes: parsed[0].price_kes,
          url: parsed[0].url,
          crawled_at: now,
        })
      }

      await rateLimiter(2000)
    } catch (error) {
      console.error(
        `Error crawling Reebelo for ${product.brand} ${product.model}:`,
        error
      )
    }
  }

  return results
}

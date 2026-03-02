import * as cheerio from 'cheerio'
import type { CrawlerProduct, PriceResult } from './types'
import { fetchWithRetry, parseKesPrice, rateLimiter } from './utils'

const JIJI_BASE_URL = 'https://jiji.co.ke'

interface JijiParseResult {
  price_kes: number
  url: string
}

/**
 * Parse a Jiji search results page and extract KES prices.
 */
export function parseJijiPage(html: string): JijiParseResult[] {
  const $ = cheerio.load(html)
  const results: JijiParseResult[] = []

  // Jiji listing cards
  $(
    '[data-testid="listing-card"], .b-list-advert__gallery__item, .qa-advert-list-item'
  ).each((_, el) => {
    const priceText = $(el)
      .find(
        '[data-testid="listing-price"], .qa-advert-price, .b-list-advert__item-price'
      )
      .text()
      .trim()
    const linkEl = $(el).find('a[href]').first()
    const href = linkEl.attr('href') ?? ''

    if (!href) return

    const price = parseKesPrice(priceText)
    if (price !== null) {
      results.push({
        price_kes: price,
        url: href.startsWith('http') ? href : `${JIJI_BASE_URL}${href}`,
      })
    }
  })

  return results
}

/**
 * Crawl Jiji Kenya for prices matching the given products.
 */
export async function crawlJiji(
  products: CrawlerProduct[]
): Promise<PriceResult[]> {
  const results: PriceResult[] = []
  const now = new Date().toISOString()

  for (const product of products) {
    try {
      const searchQuery = encodeURIComponent(
        `${product.brand} ${product.model}`
      )
      const url = `${JIJI_BASE_URL}/search?query=${searchQuery}`

      const response = await fetchWithRetry(url)
      const html = await response.text()
      const parsed = parseJijiPage(html)

      if (parsed.length > 0) {
        results.push({
          product_id: product.id,
          competitor: 'jiji',
          competitor_price_kes: parsed[0].price_kes,
          url: parsed[0].url,
          crawled_at: now,
        })
      }

      await rateLimiter(1500)
    } catch (error) {
      console.error(
        `Error crawling Jiji for ${product.brand} ${product.model}:`,
        error
      )
    }
  }

  return results
}

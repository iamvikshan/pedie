import * as cheerio from 'cheerio'
import type { CrawlerProduct, PriceResult } from './types'
import { fetchWithRetry, parseKesPrice, rateLimiter } from './utils'

const JUMIA_BASE_URL = 'https://www.jumia.co.ke'

interface JumiaParseResult {
  price_kes: number
  url: string
}

/**
 * Parse a Jumia search results page and extract KES prices.
 */
export function parseJumiaPage(html: string): JumiaParseResult[] {
  const $ = cheerio.load(html)
  const results: JumiaParseResult[] = []

  // Jumia product cards
  $('article.prd, .sku, [data-catalog]').each((_, el) => {
    const priceText = $(el)
      .find('.prc, [data-price], .price')
      .first()
      .text()
      .trim()
    const linkEl = $(el).find('a[href]').first()
    const href = linkEl.attr('href') ?? ''

    if (!href) return

    const price = parseKesPrice(priceText)
    if (price !== null) {
      results.push({
        price_kes: price,
        url: href.startsWith('http') ? href : `${JUMIA_BASE_URL}${href}`,
      })
    }
  })

  return results
}

/**
 * Crawl Jumia Kenya for prices matching the given products.
 */
export async function crawlJumia(
  products: CrawlerProduct[]
): Promise<PriceResult[]> {
  const results: PriceResult[] = []
  const now = new Date().toISOString()

  for (const product of products) {
    try {
      const searchQuery = encodeURIComponent(
        `${product.brand} ${product.model}`
      )
      const url = `${JUMIA_BASE_URL}/catalog/?q=${searchQuery}`

      const response = await fetchWithRetry(url)
      const html = await response.text()
      const parsed = parseJumiaPage(html)

      if (parsed.length > 0) {
        results.push({
          product_id: product.id,
          competitor: 'jumia',
          competitor_price_kes: parsed[0].price_kes,
          url: parsed[0].url,
          crawled_at: now,
        })
      }

      await rateLimiter(2000)
    } catch (error) {
      console.error(
        `Error crawling Jumia for ${product.brand} ${product.model}:`,
        error
      )
    }
  }

  return results
}

import * as cheerio from 'cheerio'
import type { CrawlerProduct, PriceResult } from './types'
import { fetchWithRetry, parseKesPrice, rateLimiter } from './utils'

const PHONEPLACE_BASE_URL = 'https://phoneplacekenya.com'

interface PhonePlaceParseResult {
  price_kes: number
  url: string
}

/**
 * Parse a Phone Place Kenya search results page and extract prices + URLs.
 */
export function parsePhonePlacePage(html: string): PhonePlaceParseResult[] {
  const $ = cheerio.load(html)
  const results: PhonePlaceParseResult[] = []

  $('.product-item').each((_, el) => {
    // Prefer sale price (<ins>) over original price (<del>)
    const insPrice = $(el).find('.price ins').text().trim()
    // Strip <del> content before reading fallback to avoid concatenated prices
    const priceEl = $(el).find('.price').clone()
    priceEl.find('del').remove()
    const priceText = insPrice || priceEl.text().trim()
    const linkEl = $(el).find('a[href*="/shop/"]')
    const href = linkEl.attr('href') ?? ''

    if (!href) return

    const price = parseKesPrice(priceText)
    if (price !== null) {
      results.push({
        price_kes: price,
        url: href.startsWith('http') ? href : `${PHONEPLACE_BASE_URL}${href}`,
      })
    }
  })

  return results
}

/**
 * Crawl Phone Place Kenya for prices matching the given products.
 */
export async function crawlPhonePlace(
  products: CrawlerProduct[]
): Promise<PriceResult[]> {
  const results: PriceResult[] = []
  const now = new Date().toISOString()

  for (const product of products) {
    try {
      const searchQuery = encodeURIComponent(
        `${product.brand} ${product.model}`
      )
      const url = `${PHONEPLACE_BASE_URL}/?s=${searchQuery}&post_type=product`

      const response = await fetchWithRetry(url)
      const html = await response.text()
      const parsed = parsePhonePlacePage(html)

      if (parsed.length > 0) {
        results.push({
          product_id: product.id,
          competitor: 'phoneplace',
          competitor_price_kes: parsed[0].price_kes,
          url: parsed[0].url,
          crawled_at: now,
        })
      }

      await rateLimiter(1500)
    } catch (error) {
      console.error(
        `Error crawling PhonePlace for ${product.brand} ${product.model}:`,
        error
      )
    }
  }

  return results
}

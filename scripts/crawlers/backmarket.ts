import * as cheerio from 'cheerio'
import { fetchWithRetry, parseUsdPrice, rateLimiter } from './utils'
import { KES_USD_RATE } from '../../packages/config'
import type { CrawlerProduct, PriceResult } from './types'

const BACKMARKET_BASE_URL = 'https://www.backmarket.com'

interface BackMarketParseResult {
  price_kes: number
  url: string
}

/**
 * Parse a Back Market search results page and extract USD prices converted to KES.
 */
export function parseBackMarketPage(html: string): BackMarketParseResult[] {
  const $ = cheerio.load(html)
  const results: BackMarketParseResult[] = []

  $('.productCard').each((_, el) => {
    const priceText = $(el).find('.product-price').text().trim()
    const linkEl = $(el).find('a[href*="/p/"]')
    const href = linkEl.attr('href') || ''

    const priceUsd = parseUsdPrice(priceText)
    if (priceUsd !== null) {
      results.push({
        price_kes: Math.round(priceUsd * KES_USD_RATE),
        url: href.startsWith('http') ? href : `${BACKMARKET_BASE_URL}${href}`,
      })
    }
  })

  return results
}

/**
 * Crawl Back Market for prices matching the given products.
 */
export async function crawlBackMarket(
  products: CrawlerProduct[]
): Promise<PriceResult[]> {
  const results: PriceResult[] = []
  const now = new Date().toISOString()

  for (const product of products) {
    try {
      const searchQuery = encodeURIComponent(
        `${product.brand} ${product.model}`
      )
      const url = `${BACKMARKET_BASE_URL}/en-us/search?q=${searchQuery}`

      const response = await fetchWithRetry(url)
      const html = await response.text()
      const parsed = parseBackMarketPage(html)

      if (parsed.length > 0) {
        results.push({
          product_id: product.id,
          competitor: 'backmarket',
          competitor_price_kes: parsed[0].price_kes,
          url: parsed[0].url,
          crawled_at: now,
        })
      }

      await rateLimiter(2000)
    } catch (error) {
      console.error(
        `Error crawling BackMarket for ${product.brand} ${product.model}:`,
        error
      )
    }
  }

  return results
}

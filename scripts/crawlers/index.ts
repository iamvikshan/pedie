#!/usr/bin/env bun

import { crawlBackMarket } from './backmarket'
import { crawlBadili } from './badili'
import { crawlJiji } from './jiji'
import { crawlJumia } from './jumia'
import { crawlPhonePlace } from './phoneplace'
import { crawlReebelo } from './reebelo'
import { crawlSwappa } from './swappa'
import type { CrawlerProduct, PriceResult } from './types'
import {
  createCrawlerClient,
  getProductCatalog,
  upsertPriceComparisons,
} from './utils'

interface CrawlerEntry {
  name: string
  crawl: (products: CrawlerProduct[]) => Promise<PriceResult[]>
}

const crawlers: CrawlerEntry[] = [
  { name: 'badili', crawl: crawlBadili },
  { name: 'phoneplace', crawl: crawlPhonePlace },
  { name: 'swappa', crawl: crawlSwappa },
  { name: 'backmarket', crawl: crawlBackMarket },
  { name: 'reebelo', crawl: crawlReebelo },
  { name: 'jiji', crawl: crawlJiji },
  { name: 'jumia', crawl: crawlJumia },
]

/**
 * Run all crawlers and collect results.
 * Exported for testing — the main script calls this and upserts.
 * Accepts optional crawlerOverrides for testing.
 */
export async function runCrawlers(
  products: CrawlerProduct[],
  crawlerOverrides?: CrawlerEntry[]
): Promise<PriceResult[]> {
  const crawlerList = crawlerOverrides ?? crawlers
  const allResults: PriceResult[] = []
  const errors: string[] = []

  for (const crawler of crawlerList) {
    try {
      console.log(`Running ${crawler.name} crawler...`)
      const results = await crawler.crawl(products)
      console.log(`  → ${results.length} result(s)`)
      allResults.push(...results)
    } catch (error) {
      const msg = `${crawler.name} failed: ${error instanceof Error ? error.message : String(error)}`
      console.error(`  ✗ ${msg}`)
      errors.push(msg)
    }
  }

  if (errors.length > 0) {
    console.warn(`\n${errors.length} crawler(s) had errors:`)
    errors.forEach(e => console.warn(`  - ${e}`))
  }

  return allResults
}

/**
 * Main entry point — run when executed as a script.
 */
async function main() {
  console.log('🕷️  Price Crawler starting...\n')

  const supabase = createCrawlerClient()
  const products = await getProductCatalog(supabase)

  if (products.length === 0) {
    console.log('No products with active listings found. Exiting.')
    return
  }

  console.log(`Found ${products.length} product(s) to crawl\n`)

  const results = await runCrawlers(products)

  console.log(`\n📊 Summary: ${results.length} price comparison(s) collected`)

  if (results.length > 0) {
    await upsertPriceComparisons(supabase, results)
    console.log('✅ Results upserted to database')
  }

  console.log('🏁 Price Crawler complete')
}

// Only run main when executed directly (not when imported for tests)
const isMainModule = typeof Bun !== 'undefined' && Bun.main === import.meta.path
if (isMainModule) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

import {
  getPriceComparisons,
  getLatestCrawlDate,
  getProductMinPrices,
} from '@lib/data/admin'
import { PriceComparisonTable } from '@components/admin/price-comparison-table'

interface ComparisonRow {
  id: string
  product_id: string
  competitor: string
  competitor_price_kes: number
  url: string | null
  crawled_at: string | null
  product: { brand: string; model: string } | null
}

export default async function AdminPricesPage() {
  const [rawComparisons, latestCrawl, productMinPrices] = await Promise.all([
    getPriceComparisons(),
    getLatestCrawlDate(),
    getProductMinPrices(),
  ])

  const comparisons = rawComparisons as unknown as ComparisonRow[]

  // Group comparisons by product
  const productMap = new Map<
    string,
    {
      productId: string
      productName: string
      pediePriceKes: number | null
      competitors: {
        competitor: string
        priceKes: number
        url: string | null
      }[]
    }
  >()

  for (const row of comparisons) {
    const productName = row.product
      ? `${row.product.brand} ${row.product.model}`
      : 'Unknown Product'

    if (!productMap.has(row.product_id)) {
      productMap.set(row.product_id, {
        productId: row.product_id,
        productName,
        pediePriceKes: productMinPrices.get(row.product_id) ?? null,
        competitors: [],
      })
    }

    const entry = productMap.get(row.product_id)!
    entry.competitors.push({
      competitor: row.competitor,
      priceKes: row.competitor_price_kes,
      url: row.url,
    })
  }

  const grouped = Array.from(productMap.values())

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-pedie-text'>
          Price Comparisons
        </h2>
        <div className='text-sm text-pedie-muted'>
          {comparisons.length} comparison(s)
        </div>
      </div>

      <div className='flex items-center gap-4 text-sm text-pedie-muted'>
        <span>
          Last crawl:{' '}
          {latestCrawl
            ? latestCrawl.toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Never'}
        </span>
        <span>•</span>
        <span>{grouped.length} product(s)</span>
      </div>

      <PriceComparisonTable comparisons={grouped} />
    </div>
  )
}

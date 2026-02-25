export interface CrawlerProduct {
  id: string
  brand: string
  model: string
  slug: string
}

export type CompetitorName =
  | 'badili'
  | 'phoneplace'
  | 'swappa'
  | 'backmarket'
  | 'reebelo'
  | 'jiji'
  | 'jumia'

export interface PriceResult {
  product_id: string
  competitor: CompetitorName
  competitor_price_kes: number
  url: string | null
  crawled_at: string // ISO date
}

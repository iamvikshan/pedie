'use client'

import { formatKes } from '@helpers'
import { isSafeUrl } from '@utils/format'
import { MarginIndicator } from '@components/admin/marginIndicator'

interface CompetitorEntry {
  competitor: string
  priceKes: number
  url: string | null
}

interface ProductComparison {
  productId: string
  productName: string
  pediePriceKes: number | null
  competitors: CompetitorEntry[]
}

interface PriceComparisonTableProps {
  comparisons: ProductComparison[]
}

export function PriceComparisonTable({
  comparisons,
}: PriceComparisonTableProps) {
  if (comparisons.length === 0) {
    return (
      <div className='rounded-lg border border-pedie-border bg-pedie-card p-8 text-center'>
        <p className='text-pedie-muted'>
          No price comparison data available yet.
        </p>
        <p className='mt-2 text-sm text-pedie-muted'>
          Price data will appear here once the crawlers have run.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {comparisons.map(product => (
        <div
          key={product.productId}
          className='rounded-lg border border-pedie-border bg-pedie-card'
        >
          <div className='border-b border-pedie-border px-4 py-3'>
            <h3 className='font-medium text-pedie-text'>
              {product.productName}
            </h3>
            {product.pediePriceKes !== null && (
              <p className='text-sm text-pedie-muted'>
                Pedie price: {formatKes(product.pediePriceKes)}
              </p>
            )}
          </div>
          <table className='w-full text-left text-sm'>
            <thead>
              <tr className='border-b border-pedie-border bg-pedie-card'>
                <th className='px-4 py-2 font-medium text-pedie-muted'>
                  Competitor
                </th>
                <th className='px-4 py-2 font-medium text-pedie-muted'>
                  Price
                </th>
                <th className='px-4 py-2 font-medium text-pedie-muted'>
                  Margin
                </th>
                <th className='px-4 py-2 font-medium text-pedie-muted'>Link</th>
              </tr>
            </thead>
            <tbody>
              {product.competitors.map(comp => (
                <tr
                  key={comp.competitor}
                  className='border-b border-pedie-border last:border-0'
                >
                  <td className='px-4 py-2 capitalize text-pedie-text'>
                    {comp.competitor}
                  </td>
                  <td className='px-4 py-2 text-pedie-text'>
                    {formatKes(comp.priceKes)}
                  </td>
                  <td className='px-4 py-2'>
                    {product.pediePriceKes !== null ? (
                      <MarginIndicator
                        pediePriceKes={product.pediePriceKes}
                        competitorPriceKes={comp.priceKes}
                      />
                    ) : (
                      <span className='text-pedie-muted'>—</span>
                    )}
                  </td>
                  <td className='px-4 py-2'>
                    {comp.url && isSafeUrl(comp.url) ? (
                      <a
                        href={comp.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-pedie-accent hover:underline'
                      >
                        View ↗
                      </a>
                    ) : (
                      <span className='text-pedie-muted'>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

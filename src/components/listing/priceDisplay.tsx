import { Badge } from '@components/ui/badge'
import { calculateDeposit, calculateDiscount, formatKes } from '@helpers'

interface PriceDisplayProps {
  priceKes: number
  originalPriceKes: number
  isPreorder: boolean
}

export function PriceDisplay({
  priceKes,
  originalPriceKes,
  isPreorder,
}: PriceDisplayProps) {
  const discount = calculateDiscount(originalPriceKes, priceKes)
  const deposit = calculateDeposit(priceKes)

  return (
    <div className='rounded-lg bg-pedie-card p-4 border border-pedie-border'>
      <div className='flex items-baseline gap-3'>
        <span className='text-3xl font-bold text-pedie-green'>
          {formatKes(priceKes)}
        </span>
        {discount > 0 && (
          <>
            <span className='text-lg text-pedie-text-muted line-through'>
              {formatKes(originalPriceKes)}
            </span>
            <Badge variant='discount' className='font-semibold'>
              -{discount}%
            </Badge>
          </>
        )}
      </div>

      {isPreorder && (
        <div className='mt-3 rounded-md bg-pedie-sunken p-3 border border-pedie-border'>
          <p className='text-sm text-pedie-text'>
            <span className='font-medium'>Preorder Deposit:</span>{' '}
            <span className='text-pedie-green font-semibold'>
              {formatKes(deposit)}
            </span>
          </p>
          <p className='text-xs text-pedie-text-muted mt-1'>
            Pay the remaining balance when your item arrives
          </p>
        </div>
      )}
    </div>
  )
}

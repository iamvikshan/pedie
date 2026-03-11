import type { ListingWithProduct } from '@app-types/product'
import { ConditionBadge } from '@components/ui/conditionBadge'

interface ListingInfoProps {
  listing: ListingWithProduct
}

export function ListingInfo({ listing }: ListingInfoProps) {
  const { product } = listing

  return (
    <div>
      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <span className='inline-flex items-center rounded bg-pedie-card px-2 py-1 text-xs font-mono text-pedie-text-muted border border-pedie-border'>
          {listing.sku}
        </span>
        <ConditionBadge condition={listing.condition} />
      </div>

      <h1 className='text-2xl font-bold text-pedie-text md:text-3xl'>
        {product.brand.name} {product.name}
      </h1>

      <div className='mt-4 grid grid-cols-2 gap-3'>
        {listing.storage && (
          <div className='rounded-md bg-pedie-card p-3 border border-pedie-border'>
            <span className='block text-xs text-pedie-text-muted'>Storage</span>
            <span className='text-sm font-medium text-pedie-text'>
              {listing.storage}
            </span>
          </div>
        )}
        {listing.color && (
          <div className='rounded-md bg-pedie-card p-3 border border-pedie-border'>
            <span className='block text-xs text-pedie-text-muted'>Color</span>
            <span className='text-sm font-medium text-pedie-text'>
              {listing.color}
            </span>
          </div>
        )}
        {listing.battery_health != null && (
          <div className='rounded-md bg-pedie-card p-3 border border-pedie-border'>
            <span className='block text-xs text-pedie-text-muted'>
              Battery Health
            </span>
            <span className='text-sm font-medium text-pedie-text'>
              {listing.battery_health}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

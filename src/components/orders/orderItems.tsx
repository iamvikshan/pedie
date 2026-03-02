import type { OrderItem } from '@app-types/order'
import { formatKes } from '@helpers'

interface OrderItemsListProps {
  items: OrderItem[]
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  if (items.length === 0) {
    return (
      <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
        <p className='text-sm text-pedie-text-muted'>No items in this order.</p>
      </div>
    )
  }

  return (
    <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
      <h3 className='mb-3 font-medium text-pedie-text'>
        Items ({items.length})
      </h3>
      <div className='divide-y divide-pedie-border'>
        {items.map(item => (
          <div
            key={item.id}
            className='flex items-center justify-between py-3 first:pt-0 last:pb-0'
          >
            <div>
              <p className='text-sm font-mono text-pedie-text-muted'>
                {item.listing_id.slice(0, 12)}...
              </p>
            </div>
            <div className='text-right'>
              <p className='text-sm font-medium text-pedie-text'>
                {formatKes(item.unit_price_kes)}
              </p>
              {item.deposit_kes !== null && item.deposit_kes > 0 && (
                <p className='text-xs text-pedie-green'>
                  Deposit: {formatKes(item.deposit_kes)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

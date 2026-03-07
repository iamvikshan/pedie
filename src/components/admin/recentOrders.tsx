import { Badge } from '@components/ui/badge'
import { formatKes } from '@helpers'
import { formatAdminDate } from '@utils/format'
import Link from 'next/link'

interface RecentOrdersProps {
  orders: Record<string, unknown>[]
}

const statusVariants: Record<
  string,
  'success' | 'error' | 'warning' | 'info' | 'default'
> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
      <h2 className='mb-4 text-lg font-semibold text-pedie-text'>
        Recent Orders
      </h2>
      {orders.length === 0 ? (
        <p className='text-pedie-text-muted'>No orders yet.</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead>
              <tr className='border-b border-pedie-border'>
                <th className='pb-2 font-medium text-pedie-text-muted'>
                  Order ID
                </th>
                <th className='pb-2 font-medium text-pedie-text-muted'>
                  Customer
                </th>
                <th className='pb-2 font-medium text-pedie-text-muted'>
                  Status
                </th>
                <th className='pb-2 font-medium text-pedie-text-muted'>
                  Total
                </th>
                <th className='pb-2 font-medium text-pedie-text-muted'>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const id = order.id ? String(order.id) : 'unknown'
                const status = (order.status as string) ?? 'pending'
                const profile = order.profile as Record<string, unknown> | null
                const customerName = (profile?.full_name as string) ?? 'Unknown'
                const total = (order.total_kes as number) ?? 0
                const date = order.created_at
                  ? formatAdminDate(order.created_at as string)
                  : '—'

                return (
                  <tr
                    key={id}
                    className='border-b border-pedie-border last:border-0'
                  >
                    <td className='py-2'>
                      <Link
                        href={`/admin/orders/${id}`}
                        className='text-pedie-green hover:underline'
                      >
                        {id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className='py-2 text-pedie-text'>{customerName}</td>
                    <td className='py-2'>
                      <Badge
                        variant={statusVariants[status] ?? 'default'}
                        size='sm'
                      >
                        {status}
                      </Badge>
                    </td>
                    <td className='py-2 text-pedie-text'>{formatKes(total)}</td>
                    <td className='py-2 text-pedie-text-muted'>{date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

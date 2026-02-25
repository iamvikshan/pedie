import Link from 'next/link'
import { formatKes } from '@lib/constants'

interface RecentOrdersProps {
  orders: Record<string, unknown>[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
      <h2 className='mb-4 text-lg font-semibold text-pedie-text'>
        Recent Orders
      </h2>
      {orders.length === 0 ? (
        <p className='text-pedie-muted'>No orders yet.</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead>
              <tr className='border-b border-pedie-border'>
                <th className='pb-2 font-medium text-pedie-muted'>Order ID</th>
                <th className='pb-2 font-medium text-pedie-muted'>Customer</th>
                <th className='pb-2 font-medium text-pedie-muted'>Status</th>
                <th className='pb-2 font-medium text-pedie-muted'>Total</th>
                <th className='pb-2 font-medium text-pedie-muted'>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const id = order.id as string
                const status = (order.status as string) ?? 'pending'
                const profile = order.profile as Record<string, unknown> | null
                const customerName = (profile?.full_name as string) ?? 'Unknown'
                const total = (order.total_kes as number) ?? 0
                const date = order.created_at
                  ? new Date(order.created_at as string).toLocaleDateString()
                  : '—'

                return (
                  <tr
                    key={id}
                    className='border-b border-pedie-border last:border-0'
                  >
                    <td className='py-2'>
                      <Link
                        href={`/admin/orders/${id}`}
                        className='text-pedie-primary hover:underline'
                      >
                        {id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className='py-2 text-pedie-text'>{customerName}</td>
                    <td className='py-2'>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status] ?? 'bg-gray-100 text-gray-800'}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className='py-2 text-pedie-text'>{formatKes(total)}</td>
                    <td className='py-2 text-pedie-muted'>{date}</td>
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

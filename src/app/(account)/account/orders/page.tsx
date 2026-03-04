import { formatKes } from '@helpers'
import { requireAuth } from '@helpers/auth'
import { getOrdersByUser } from '@data/orders'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default async function OrdersListPage() {
  const user = await requireAuth()
  const orders = await getOrdersByUser(user!.id)

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-pedie-text'>My Orders</h1>

      {orders.length === 0 ? (
        <div className='rounded-lg border border-pedie-border bg-pedie-card p-8 text-center'>
          <p className='text-pedie-text-muted'>No orders yet.</p>
          <Link
            href='/collections'
            className='mt-4 inline-block text-sm text-pedie-green hover:underline'
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className='space-y-3'>
          {orders.map(order => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className='block rounded-lg border border-pedie-border bg-pedie-card p-4 transition-colors hover:bg-pedie-card-hover'
            >
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='flex items-center gap-3'>
                  <span className='font-mono text-sm text-pedie-text'>
                    {order.id.slice(0, 8)}...
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[order.status || 'pending'] ||
                      'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {order.status || 'pending'}
                  </span>
                </div>
                <div className='flex items-center gap-4 text-sm'>
                  <span className='text-pedie-text-muted capitalize'>
                    {order.payment_method}
                  </span>
                  <span className='font-medium text-pedie-text'>
                    {formatKes(order.total_kes)}
                  </span>
                </div>
              </div>
              <p className='mt-1 text-xs text-pedie-text-muted'>
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString('en-KE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

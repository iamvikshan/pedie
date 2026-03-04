import { OrderItemsList } from '@components/orders/orderItems'
import { OrderStatusTimeline } from '@components/orders/statusTimeline'
import { formatKes } from '@helpers'
import { requireAuth } from '@helpers/auth'
import { getOrderById } from '@data/orders'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireAuth()
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) {
    return notFound()
  }
  if (order.user_id !== user.id) {
    return notFound()
  }

  const shipping = order.shipping_address as {
    full_name?: string
    city?: string
    county?: string
  } | null

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-pedie-text'>Order Details</h1>
        <Link
          href='/collections'
          className='text-sm text-pedie-green hover:underline'
        >
          Continue Shopping
        </Link>
      </div>

      {/* Order ID & Date */}
      <div className='mb-6 rounded-lg border border-pedie-border bg-pedie-card p-4'>
        <div className='flex flex-wrap gap-4 text-sm'>
          <div>
            <span className='text-pedie-text-muted'>Order ID</span>
            <p className='font-mono text-pedie-text'>
              {order.id.slice(0, 8)}...
            </p>
          </div>
          <div>
            <span className='text-pedie-text-muted'>Date</span>
            <p className='text-pedie-text'>
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
          <div>
            <span className='text-pedie-text-muted'>Payment</span>
            <p className='text-pedie-text capitalize'>
              {order.payment_method || 'N/A'}
            </p>
          </div>
          {order.payment_ref && (
            <div>
              <span className='text-pedie-text-muted'>Reference</span>
              <p className='font-mono text-pedie-text'>{order.payment_ref}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <OrderStatusTimeline status={order.status || 'pending'} />

      {/* Items */}
      <OrderItemsList items={order.items} />

      {/* Price Summary */}
      <div className='mt-6 rounded-lg border border-pedie-border bg-pedie-card p-4'>
        <h3 className='mb-3 font-medium text-pedie-text'>Payment Summary</h3>
        <div className='space-y-1 text-sm'>
          <div className='flex justify-between text-pedie-text'>
            <span>Subtotal</span>
            <span>{formatKes(order.subtotal_kes)}</span>
          </div>
          {order.shipping_fee_kes !== null && order.shipping_fee_kes > 0 && (
            <div className='flex justify-between text-pedie-text'>
              <span>Shipping</span>
              <span>{formatKes(order.shipping_fee_kes)}</span>
            </div>
          )}
          <div className='flex justify-between font-semibold text-pedie-text border-t border-pedie-border pt-1 mt-1'>
            <span>Total</span>
            <span>{formatKes(order.total_kes)}</span>
          </div>
          {order.deposit_amount_kes !== null &&
            order.deposit_amount_kes > 0 && (
              <div className='flex justify-between text-pedie-green'>
                <span>Deposit Paid</span>
                <span>{formatKes(order.deposit_amount_kes)}</span>
              </div>
            )}
          {order.balance_due_kes !== null && order.balance_due_kes > 0 && (
            <div className='flex justify-between text-yellow-400'>
              <span>Balance Due</span>
              <span>{formatKes(order.balance_due_kes)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Shipping Address */}
      {shipping && (shipping.full_name || shipping.city) && (
        <div className='mt-6 rounded-lg border border-pedie-border bg-pedie-card p-4'>
          <h3 className='mb-2 font-medium text-pedie-text'>Shipping Address</h3>
          <p className='text-sm text-pedie-text-muted'>
            {shipping.full_name}
            <br />
            {shipping.city}
            {shipping.county ? `, ${shipping.county}` : ''}
          </p>
        </div>
      )}
    </div>
  )
}

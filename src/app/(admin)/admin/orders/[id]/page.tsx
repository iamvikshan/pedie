import { OrderStatusUpdater } from '@components/admin/orderStatusUpdater'
import { TrackingForm } from '@components/admin/trackingForm'
import { OrderStatusTimeline } from '@components/orders/statusTimeline'
import { formatKes } from '@helpers'
import { getAdminOrderDetail } from '@data/admin'
import { formatAdminDate } from '@utils/format'
import { notFound } from 'next/navigation'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { order, items, customer } = await getAdminOrderDetail(id)

  if (!order) {
    notFound()
  }

  const shippingAddress = order.shipping_address as Record<
    string,
    string
  > | null
  const trackingInfo = order.tracking_info as Record<string, string> | null

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-pedie-text'>
          Order {String(order.id ?? '').slice(0, 8)}…
        </h2>
      </div>

      <OrderStatusTimeline status={(order.status as string) ?? 'pending'} />

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Order Info */}
        <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
          <h3 className='mb-3 font-medium text-pedie-text'>
            Order Information
          </h3>
          <dl className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Order ID</dt>
              <dd className='font-mono text-pedie-text'>
                {order.id as string}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Status</dt>
              <dd className='capitalize text-pedie-text'>
                {(order.status as string) ?? 'pending'}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Payment Method</dt>
              <dd className='uppercase text-pedie-text'>
                {(order.payment_method as string) ?? '—'}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Subtotal</dt>
              <dd className='text-pedie-text'>
                {formatKes(order.subtotal_kes as number)}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Shipping Fee</dt>
              <dd className='text-pedie-text'>
                {formatKes((order.shipping_fee_kes as number) ?? 0)}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Total</dt>
              <dd className='font-semibold text-pedie-text'>
                {formatKes(order.total_kes as number)}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Deposit</dt>
              <dd className='text-pedie-text'>
                {formatKes((order.deposit_amount_kes as number) ?? 0)}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Balance Due</dt>
              <dd className='text-pedie-text'>
                {formatKes((order.balance_due_kes as number) ?? 0)}
              </dd>
            </div>
            {order.payment_ref ? (
              <div className='flex justify-between'>
                <dt className='text-pedie-muted'>Payment Ref</dt>
                <dd className='font-mono text-pedie-text'>
                  {String(order.payment_ref)}
                </dd>
              </div>
            ) : null}
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Created</dt>
              <dd className='text-pedie-text'>
                {order.created_at
                  ? formatAdminDate(order.created_at as string, {
                      includeTime: true,
                    })
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Customer Info */}
        <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
          <h3 className='mb-3 font-medium text-pedie-text'>Customer</h3>
          {customer ? (
            <dl className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <dt className='text-pedie-muted'>Name</dt>
                <dd className='text-pedie-text'>
                  {(customer.full_name as string) ?? '—'}
                </dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-pedie-muted'>Phone</dt>
                <dd className='text-pedie-text'>
                  {(customer.phone as string) ?? '—'}
                </dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-pedie-muted'>Customer ID</dt>
                <dd className='font-mono text-pedie-text'>
                  {String(customer.id ?? '').slice(0, 8)}…
                </dd>
              </div>
            </dl>
          ) : (
            <p className='text-sm text-pedie-muted'>Customer not found</p>
          )}

          {shippingAddress && (
            <>
              <h4 className='mt-4 mb-2 text-sm font-medium text-pedie-text'>
                Shipping Address
              </h4>
              <p className='text-sm text-pedie-muted'>
                {shippingAddress.full_name && (
                  <>
                    {shippingAddress.full_name}
                    <br />
                  </>
                )}
                {shippingAddress.address && (
                  <>
                    {shippingAddress.address}
                    <br />
                  </>
                )}
                {shippingAddress.city && (
                  <>
                    {shippingAddress.city}
                    <br />
                  </>
                )}
                {shippingAddress.phone && <>{shippingAddress.phone}</>}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
        <h3 className='mb-3 font-medium text-pedie-text'>Items</h3>
        <table className='w-full text-left text-sm'>
          <thead>
            <tr className='border-b border-pedie-border'>
              <th className='px-2 py-2 font-medium text-pedie-muted'>
                Listing
              </th>
              <th className='px-2 py-2 font-medium text-pedie-muted'>
                Product
              </th>
              <th className='px-2 py-2 text-right font-medium text-pedie-muted'>
                Price
              </th>
              <th className='px-2 py-2 text-right font-medium text-pedie-muted'>
                Deposit
              </th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map(item => {
              const listing = item.listing as Record<string, unknown> | null
              const product = listing?.product as {
                brand: { name: string } | null
                name: string
              } | null
              return (
                <tr
                  key={item.id as string}
                  className='border-b border-pedie-border last:border-0'
                >
                  <td className='px-2 py-2 font-mono text-xs text-pedie-text'>
                    {(listing?.sku as string) ?? (item.listing_id as string)}
                  </td>
                  <td className='px-2 py-2 text-pedie-text'>
                    {product
                      ? `${product.brand?.name ?? ''} ${product.name}`.trim() ||
                        '—'
                      : '—'}
                  </td>
                  <td className='px-2 py-2 text-right text-pedie-text'>
                    {formatKes(item.unit_price_kes as number)}
                  </td>
                  <td className='px-2 py-2 text-right text-pedie-text'>
                    {formatKes((item.deposit_kes as number) ?? 0)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Status Updater + Tracking Form */}
      <div className='grid gap-6 md:grid-cols-2'>
        <OrderStatusUpdater
          orderId={order.id as string}
          currentStatus={(order.status as string) ?? 'pending'}
        />
        <TrackingForm
          orderId={order.id as string}
          initialTracking={trackingInfo}
          initialNotes={(order.notes as string) ?? null}
        />
      </div>
    </div>
  )
}

import Link from 'next/link'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderId?: string
    paypalId?: string
    receipt?: string
  }>
}) {
  const { orderId: rawOrderId, paypalId, receipt } = await searchParams
  const orderId =
    rawOrderId && UUID_PATTERN.test(rawOrderId) ? rawOrderId : null

  return (
    <div className='mx-auto max-w-2xl px-4 py-16 text-center'>
      <div className='mb-6 flex justify-center'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-pedie-green/20'>
          <svg
            className='h-8 w-8 text-pedie-green'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
      </div>

      <h1 className='text-2xl font-bold text-pedie-text'>Order Confirmed!</h1>
      <p className='mt-2 text-pedie-text-muted'>
        Thank you for your order. We&apos;ll send you updates as it progresses.
      </p>

      {orderId && (
        <p className='mt-4 text-sm text-pedie-text-muted'>
          Order ID: <span className='font-mono text-pedie-text'>{orderId}</span>
        </p>
      )}

      {(paypalId || receipt) && (
        <p className='mt-2 text-sm text-pedie-text-muted'>
          Payment Reference:{' '}
          <span className='font-mono text-pedie-text'>
            {paypalId || receipt}
          </span>
        </p>
      )}

      <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center'>
        {orderId && (
          <Link
            href={`/orders/${orderId}`}
            className='inline-flex items-center justify-center rounded-lg bg-pedie-green px-6 py-2.5 text-sm font-medium text-white hover:bg-pedie-green/90 transition-colors'
          >
            Track Order
          </Link>
        )}
        <Link
          href='/collections'
          className='inline-flex items-center justify-center rounded-lg border border-pedie-border px-6 py-2.5 text-sm font-medium text-pedie-text hover:bg-pedie-card transition-colors'
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

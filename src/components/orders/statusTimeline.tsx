const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
] as const

const STEP_INDEX: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
}

interface OrderStatusTimelineProps {
  status: string
}

export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  const stepIndex = STEP_INDEX[status]
  const isUnknown = stepIndex === undefined
  const currentIndex = stepIndex ?? -1
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className='mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4'>
        <p className='text-sm font-medium text-red-400'>Order Cancelled</p>
      </div>
    )
  }

  return (
    <div className='mb-6 rounded-lg border border-pedie-border bg-pedie-card p-4'>
      <h3 className='mb-4 font-medium text-pedie-text'>
        Order Status
        {isUnknown && (
          <span className='ml-2 text-sm text-yellow-400'>(Unknown Status)</span>
        )}
      </h3>
      <div className='flex items-center justify-between'>
        {ORDER_STEPS.map((step, index) => (
          <div key={step.key} className='flex flex-1 items-center'>
            <div className='flex flex-col items-center'>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  index <= currentIndex
                    ? 'bg-pedie-green text-white'
                    : 'bg-pedie-border text-pedie-text-muted'
                }`}
              >
                {index < currentIndex ? (
                  <svg
                    className='h-4 w-4'
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
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-1 text-xs ${
                  index <= currentIndex
                    ? 'text-pedie-text font-medium'
                    : 'text-pedie-text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < ORDER_STEPS.length - 1 && (
              <div
                className={`mx-1 h-px flex-1 ${
                  index < currentIndex ? 'bg-pedie-green' : 'bg-pedie-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

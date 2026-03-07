import { StepIndicator } from '@components/ui/stepIndicator'

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

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
      <div className='mb-6 rounded-lg border border-pedie-error/30 bg-pedie-error-bg p-4'>
        <p className='text-sm font-medium text-pedie-error'>Order Cancelled</p>
      </div>
    )
  }

  return (
    <div className='mb-6 rounded-lg border border-pedie-border bg-pedie-card p-4'>
      <h3 className='mb-4 font-medium text-pedie-text'>
        Order Status
        {isUnknown && (
          <span className='ml-2 text-sm text-pedie-warning'>
            (Unknown Status)
          </span>
        )}
      </h3>
      <StepIndicator steps={ORDER_STEPS} currentIndex={currentIndex} />
    </div>
  )
}

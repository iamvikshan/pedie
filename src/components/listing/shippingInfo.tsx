import { SHIPPING_DAYS_MIN, SHIPPING_DAYS_MAX } from '@/config'

export function ShippingInfo() {
  return (
    <div className='rounded-lg bg-pedie-card p-4 border border-pedie-border'>
      <div className='flex items-start gap-3'>
        <svg
          className='h-6 w-6 flex-shrink-0 text-pedie-green mt-0.5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-2.25m0 0V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h2.25'
          />
        </svg>
        <div>
          <p className='font-medium text-pedie-text'>
            Free Shipping via Aquantuo
          </p>
          <p className='text-sm text-pedie-text-muted mt-1'>
            Estimated delivery: {SHIPPING_DAYS_MIN}-{SHIPPING_DAYS_MAX} business
            days
          </p>
        </div>
      </div>
    </div>
  )
}

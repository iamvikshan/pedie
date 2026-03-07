import { SHIPPING_DAYS_MAX, SHIPPING_DAYS_MIN } from '@/config'
import { TbTruck } from 'react-icons/tb'

export function ShippingInfo() {
  return (
    <div className='rounded-lg bg-pedie-card p-4 border border-pedie-border'>
      <div className='flex items-start gap-3'>
        <TbTruck
          className='mt-0.5 h-6 w-6 flex-shrink-0 text-pedie-green'
          aria-hidden='true'
        />
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

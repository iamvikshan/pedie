'use client'

export type PaymentMethod = 'mpesa' | 'paypal'

interface PaymentSelectorProps {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

export function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) {
  return (
    <div className='space-y-3'>
      <h2 className='text-lg font-semibold text-pedie-text'>Payment Method</h2>

      <button
        type='button'
        onClick={() => onSelect('mpesa')}
        className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
          selected === 'mpesa'
            ? 'border-pedie-green bg-pedie-green/10'
            : 'border-pedie-border bg-pedie-card hover:border-pedie-text-muted'
        }`}
      >
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-pedie-success text-white text-sm font-bold'>
          M
        </div>
        <div>
          <p className='font-medium text-pedie-text'>M-Pesa</p>
          <p className='text-sm text-pedie-text-muted'>
            Pay via STK Push to your phone
          </p>
        </div>
        {selected === 'mpesa' && (
          <svg
            className='ml-auto h-5 w-5 text-pedie-green'
            fill='currentColor'
            viewBox='0 0 20 20'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
        )}
      </button>

      <button
        type='button'
        onClick={() => onSelect('paypal')}
        className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
          selected === 'paypal'
            ? 'border-pedie-green bg-pedie-green/10'
            : 'border-pedie-border bg-pedie-card hover:border-pedie-text-muted'
        }`}
      >
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-pedie-info text-white text-sm font-bold'>
          P
        </div>
        <div>
          <p className='font-medium text-pedie-text'>PayPal</p>
          <p className='text-sm text-pedie-text-muted'>
            Pay with your PayPal account
          </p>
        </div>
        {selected === 'paypal' && (
          <svg
            className='ml-auto h-5 w-5 text-pedie-green'
            fill='currentColor'
            viewBox='0 0 20 20'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
        )}
      </button>
    </div>
  )
}

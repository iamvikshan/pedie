import Link from 'next/link'
import { Button } from '@components/ui/button'

export function SustainabilitySection() {
  return (
    <section className='py-20 bg-pedie-card border-y border-pedie-border relative overflow-hidden'>
      <div
        className='absolute inset-0 opacity-10 pointer-events-none'
        aria-hidden='true'
      >
        <svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern
              id='leaf-pattern'
              x='0'
              y='0'
              width='100'
              height='100'
              patternUnits='userSpaceOnUse'
            >
              <path
                d='M50 20 C 70 20, 80 40, 80 60 C 80 80, 60 90, 50 90 C 40 90, 20 80, 20 60 C 20 40, 30 20, 50 20 Z'
                fill='currentColor'
                className='text-pedie-green'
              />
            </pattern>
          </defs>
          <rect
            x='0'
            y='0'
            width='100%'
            height='100%'
            fill='url(#leaf-pattern)'
          />
        </svg>
      </div>

      <div className='container mx-auto px-4 md:px-6 relative z-10'>
        <div className='max-w-3xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-pedie-text mb-6'>
            Join the Circular Economy
          </h2>
          <p className='text-lg text-pedie-text-muted mb-10'>
            By choosing refurbished electronics, you&apos;re not just saving
            money—you&apos;re actively reducing e-waste and extending the
            lifecycle of perfectly good devices. Every purchase makes a
            difference.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
            <div className='p-6 rounded-xl bg-pedie-dark border border-pedie-border'>
              <div className='text-3xl font-bold text-pedie-green mb-2'>
                1000+
              </div>
              <div className='text-sm text-pedie-text-muted'>Devices Saved</div>
            </div>
            <div className='p-6 rounded-xl bg-pedie-dark border border-pedie-border'>
              <div className='text-3xl font-bold text-pedie-green mb-2'>
                40%
              </div>
              <div className='text-sm text-pedie-text-muted'>
                Average Savings
              </div>
            </div>
            <div className='p-6 rounded-xl bg-pedie-dark border border-pedie-border'>
              <div className='text-3xl font-bold text-pedie-green mb-2'>
                3-Month
              </div>
              <div className='text-sm text-pedie-text-muted'>Warranty</div>
            </div>
          </div>

          <Link href='/collections/smartphones'>
            <Button size='lg' className='px-8'>
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

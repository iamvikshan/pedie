import Link from 'next/link'
import { TbPigMoney, TbShieldCheck, TbTestPipe, TbTruck } from 'react-icons/tb'

export function TrustBanner() {
  return (
    <section className='py-16 pedie-container w-full'>
      <div className='bg-pedie-surface border border-pedie-border rounded-xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8'>
        <div className='flex flex-col gap-4 max-w-md'>
          <h2 className='text-xl font-bold text-pedie-text'>
            Why Buy Refurbished?
          </h2>
          <p className='text-pedie-text-muted text-lg'>
            Save money while making a positive impact on the environment. Every
            device is rigorously tested to ensure premium quality.
          </p>
          <Link
            href='/about'
            className='inline-block bg-pedie-green text-white font-medium px-6 py-3 rounded-xl w-fit mt-2 hover:bg-pedie-green/90 transition-colors'
          >
            Learn More
          </Link>
        </div>

        <div className='grid grid-cols-2 gap-4 md:gap-6 w-full md:w-auto'>
          <div className='flex flex-col items-center md:items-start gap-2 bg-pedie-card p-4 rounded-xl border border-pedie-border'>
            <TbPigMoney
              className='w-8 h-8 text-pedie-green'
              aria-hidden='true'
            />
            <span className='font-medium text-pedie-text'>Save up to 60%</span>
          </div>
          <div className='flex flex-col items-center md:items-start gap-2 bg-pedie-card p-4 rounded-xl border border-pedie-border'>
            <TbShieldCheck
              className='w-8 h-8 text-pedie-green'
              aria-hidden='true'
            />
            <span className='font-medium text-pedie-text'>
              3-Month Warranty
            </span>
          </div>
          <div className='flex flex-col items-center md:items-start gap-2 bg-pedie-card p-4 rounded-xl border border-pedie-border'>
            <TbTestPipe
              className='w-8 h-8 text-pedie-green'
              aria-hidden='true'
            />
            <span className='font-medium text-pedie-text'>Quality Tested</span>
          </div>
          <div className='flex flex-col items-center md:items-start gap-2 bg-pedie-card p-4 rounded-xl border border-pedie-border'>
            <TbTruck className='w-8 h-8 text-pedie-green' aria-hidden='true' />
            <span className='font-medium text-pedie-text'>Fast Delivery</span>
          </div>
        </div>
      </div>
    </section>
  )
}

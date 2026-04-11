import { TbArrowsExchange } from 'react-icons/tb'

export const metadata = {
  title: 'Trade In — Pedie',
  description:
    'Trade in your old devices for credit towards refurbished tech. Coming soon to Pedie.',
}

export default function TradeInPage() {
  return (
    <section className='flex min-h-[60vh] flex-col items-center justify-center px-4 text-center'>
      <TbArrowsExchange className='h-16 w-16 text-pedie-text-muted mb-6' />
      <h1 className='text-3xl font-bold text-pedie-text mb-3'>Trade In</h1>
      <p className='max-w-md text-pedie-text-muted mb-6'>
        Trade in your old devices for credit towards refurbished tech. Get the
        best value for your used electronics and upgrade to something better.
      </p>
      <span className='inline-flex items-center rounded-full bg-pedie-green/10 px-4 py-2 text-sm font-medium text-pedie-green'>
        Coming Soon
      </span>
    </section>
  )
}

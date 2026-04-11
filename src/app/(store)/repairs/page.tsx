import { TbTool } from 'react-icons/tb'

export const metadata = {
  title: 'Repairs — Pedie',
  description:
    'Professional device repair services for smartphones, laptops, tablets, and more. Coming soon to Pedie.',
}

export default function RepairsPage() {
  return (
    <section className='flex min-h-[60vh] flex-col items-center justify-center px-4 text-center'>
      <TbTool className='h-16 w-16 text-pedie-text-muted mb-6' />
      <h1 className='text-3xl font-bold text-pedie-text mb-3'>Repairs</h1>
      <p className='max-w-md text-pedie-text-muted mb-6'>
        Professional device repair services for smartphones, laptops, tablets,
        and more. Our certified technicians will get your devices working like
        new.
      </p>
      <span className='inline-flex items-center rounded-full bg-pedie-green/10 px-4 py-2 text-sm font-medium text-pedie-green'>
        Coming Soon
      </span>
    </section>
  )
}

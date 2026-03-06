import { ProductCardSkeleton } from '@components/skeletons/productCardSkeleton'

export function HotDealsSkeleton() {
  return (
    <section className='py-16 w-full pedie-container'>
      <div className='flex items-center justify-between mb-8 animate-pulse'>
        <div className='h-7 w-32 rounded bg-pedie-card' />
        <div className='h-5 w-20 rounded bg-pedie-card' />
      </div>

      <div className='rounded-lg overflow-hidden border border-pedie-border bg-pedie-card'>
        <div className='grid grid-cols-1 md:grid-cols-6 h-[400px]'>
          <div className='md:col-span-1 bg-pedie-dark p-6 flex flex-col items-center justify-center border-r border-pedie-border gap-4 h-full animate-pulse'>
            <div className='w-10 h-10 rounded-full bg-pedie-border/20' />
            <div className='h-7 w-24 rounded bg-pedie-border/20' />
            <div className='h-10 w-full rounded bg-pedie-border/20' />
            <div className='h-10 w-full rounded-lg bg-pedie-border/20 mt-2' />
          </div>
          <div className='md:col-span-5 p-6'>
            <div className='flex overflow-x-auto gap-4 pb-2 hide-scrollbar'>
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className='min-w-[180px] max-w-[200px] flex-shrink-0'
                >
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

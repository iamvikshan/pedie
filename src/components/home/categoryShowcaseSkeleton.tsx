import { ProductFamilyCardSkeleton } from '@components/skeletons/productFamilyCardSkeleton'

export function CategoryShowcaseSkeleton() {
  return (
    <section className='py-16 w-full max-w-7xl mx-auto px-4 md:px-6'>
      <div className='flex items-center justify-between mb-8 animate-pulse'>
        <div className='h-8 w-48 rounded bg-pedie-card' />
        <div className='h-5 w-20 rounded bg-pedie-card' />
      </div>
      <div className='flex overflow-x-auto gap-6 pb-8 hide-scrollbar'>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className='min-w-[280px] max-w-[300px]'>
            <ProductFamilyCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  )
}

import { Skeleton } from '@components/ui/skeleton'

export default function HomeLoading() {
  return (
    <div className='flex flex-col gap-8'>
      {/* Hero skeleton */}
      <Skeleton className='h-[400px] w-full rounded-none' />

      {/* Trust badges skeleton */}
      <div className='flex justify-center gap-8 px-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-32 rounded-xl' />
        ))}
      </div>

      {/* Categories skeleton */}
      <div className='max-w-7xl mx-auto w-full px-4'>
        <Skeleton className='h-8 w-48 mb-6' />
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-40 rounded-2xl' />
          ))}
        </div>
      </div>

      {/* Product section skeleton */}
      <div className='max-w-7xl mx-auto w-full px-4'>
        <Skeleton className='h-8 w-64 mb-6' />
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='flex flex-col gap-3'>
              <Skeleton className='aspect-square rounded-2xl' />
              <Skeleton className='h-5 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
              <Skeleton className='h-6 w-1/3' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

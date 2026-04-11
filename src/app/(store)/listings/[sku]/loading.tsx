export default function ListingLoading() {
  return (
    <section className='pedie-container py-8'>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        {/* Image skeleton */}
        <div>
          <div className='aspect-square animate-pulse rounded-lg bg-pedie-card border border-pedie-border' />
          <div className='mt-3 flex gap-2'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='h-16 w-16 animate-pulse rounded-md bg-pedie-card border border-pedie-border'
              />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className='flex flex-col gap-4'>
          <div className='flex gap-2'>
            <div className='h-6 w-24 animate-pulse rounded bg-pedie-card' />
            <div className='h-6 w-20 animate-pulse rounded bg-pedie-card' />
          </div>
          <div className='h-9 w-3/4 animate-pulse rounded bg-pedie-card' />
          <div className='grid grid-cols-2 gap-3'>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className='h-16 animate-pulse rounded-md bg-pedie-card border border-pedie-border'
              />
            ))}
          </div>
          <div className='h-24 animate-pulse rounded-lg bg-pedie-card border border-pedie-border' />
          <div className='h-11 animate-pulse rounded-md bg-pedie-card' />
          <div className='h-20 animate-pulse rounded-lg bg-pedie-card border border-pedie-border' />
        </div>
      </div>

      {/* Below fold skeleton */}
      <div className='mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <div className='h-48 animate-pulse rounded-lg bg-pedie-card border border-pedie-border' />
        <div className='h-48 animate-pulse rounded-lg bg-pedie-card border border-pedie-border' />
      </div>
    </section>
  )
}

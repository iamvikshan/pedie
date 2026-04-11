export default function ProductDetailLoading() {
  return (
    <section
      className='pedie-container py-8'
      role='status'
      aria-label='Loading'
    >
      {/* Hero: 2-col grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16'>
        {/* Left column — image gallery */}
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

        {/* Right column — product info */}
        <div className='flex flex-col gap-6'>
          {/* Title */}
          <div className='h-9 w-3/4 animate-pulse rounded bg-pedie-card' />

          {/* Variant pills */}
          <div className='grid grid-cols-3 gap-3'>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className='h-12 animate-pulse rounded-md bg-pedie-card border border-pedie-border'
              />
            ))}
          </div>

          {/* Price block */}
          <div className='h-20 animate-pulse rounded-lg bg-pedie-card border border-pedie-border' />

          {/* CTA button */}
          <div className='h-12 animate-pulse rounded-md bg-pedie-card' />

          {/* Quick specs */}
          <div className='h-24 animate-pulse rounded-lg bg-pedie-card border border-pedie-border' />
        </div>
      </div>

      {/* Below fold — description + specs */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16'>
        <div className='lg:col-span-2 space-y-8'>
          <div className='h-48 animate-pulse rounded-lg bg-pedie-card border border-pedie-border' />
          <div className='h-48 animate-pulse rounded-lg bg-pedie-card border border-pedie-border' />
        </div>
      </div>

      {/* Similar listings row */}
      <div>
        <div className='h-8 w-48 animate-pulse rounded bg-pedie-card mb-6' />
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className='animate-pulse rounded-2xl bg-pedie-card border border-pedie-border overflow-hidden'
            >
              <div className='aspect-square bg-pedie-card' />
              <div className='p-4 space-y-3'>
                <div className='h-4 w-3/4 rounded bg-pedie-border' />
                <div className='h-4 w-1/2 rounded bg-pedie-border' />
                <div className='h-6 w-1/3 rounded bg-pedie-border' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

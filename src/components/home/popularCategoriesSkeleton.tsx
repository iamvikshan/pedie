export function PopularCategoriesSkeleton() {
  return (
    <section className='py-16 w-full pedie-container'>
      <div className='flex items-center justify-between mb-8 animate-pulse'>
        <div className='h-7 w-48 rounded bg-pedie-card' />
        <div className='h-5 w-20 rounded bg-pedie-card' />
      </div>
      <div className='grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4'>
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div
            key={i}
            className='flex flex-col items-center gap-3 animate-pulse'
          >
            <div className='relative h-20 w-20 md:h-24 md:w-24 rounded-full bg-pedie-card' />
            <div className='h-4 w-16 rounded bg-pedie-card' />
          </div>
        ))}
      </div>
    </section>
  )
}

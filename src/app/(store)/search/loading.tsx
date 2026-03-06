export default function SearchLoading() {
  return (
    <div className='w-full pedie-container py-8'>
      <div className='mb-8'>
        <div className='h-8 w-72 bg-pedie-border rounded animate-pulse mb-2' />
        <div className='h-5 w-32 bg-pedie-border rounded animate-pulse' />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='rounded-xl border border-pedie-border bg-pedie-card overflow-hidden'
          >
            <div className='aspect-square bg-pedie-border animate-pulse' />
            <div className='p-4 space-y-3'>
              <div className='h-4 w-3/4 bg-pedie-border rounded animate-pulse' />
              <div className='h-4 w-1/2 bg-pedie-border rounded animate-pulse' />
              <div className='h-6 w-1/3 bg-pedie-border rounded animate-pulse' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

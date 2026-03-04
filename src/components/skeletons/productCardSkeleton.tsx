export function ProductCardSkeleton() {
  return (
    <div
      className='flex flex-col glass rounded-2xl shadow-lg overflow-hidden border border-pedie-border animate-pulse'
      role='status'
      aria-label='Loading'
    >
      {/* Image placeholder */}
      <div className='aspect-square bg-pedie-card w-full' />

      {/* Content section */}
      <div className='p-4 flex flex-col flex-grow'>
        <div className='h-5 w-3/4 rounded bg-pedie-card mb-2' />
        <div className='h-4 w-1/2 rounded bg-pedie-card mb-3' />

        {/* Pricing area */}
        <div className='mt-auto pt-3 border-t border-pedie-border'>
          <div className='h-6 w-1/3 rounded bg-pedie-card' />
        </div>
      </div>
    </div>
  )
}

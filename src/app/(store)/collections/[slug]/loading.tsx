export default function CollectionLoading() {
  return (
    <div className='w-full pedie-container py-8 animate-pulse'>
      {/* Banner Skeleton */}
      <div className='w-full h-[200px] bg-pedie-card rounded-xl mb-8 border border-pedie-border' />

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Sidebar Skeleton */}
        <aside className='w-full lg:w-1/4 flex-shrink-0'>
          <div className='h-10 bg-pedie-card rounded-md mb-4 lg:hidden' />
          <div className='hidden lg:block space-y-6 bg-pedie-card p-6 rounded-xl border border-pedie-border'>
            <div className='h-6 w-24 bg-pedie-border rounded mb-4' />
            {[1, 2, 3, 4].map(section => (
              <div key={section} className='border-t border-pedie-border pt-4'>
                <div className='h-5 w-20 bg-pedie-border rounded mb-3' />
                <div className='space-y-2'>
                  {[1, 2, 3].map(item => (
                    <div key={item} className='flex items-center gap-2'>
                      <div className='w-4 h-4 bg-pedie-border rounded' />
                      <div className='h-4 w-16 bg-pedie-border rounded' />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <section className='w-full lg:w-3/4'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
            <div className='h-6 w-32 bg-pedie-card rounded' />
            <div className='h-10 w-48 bg-pedie-card rounded-md' />
          </div>

          {/* Grid Skeleton */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[1, 2, 3, 4, 5, 6].map(item => (
              <div
                key={item}
                className='bg-pedie-card rounded-xl shadow-lg overflow-hidden border border-pedie-border'
              >
                <div className='aspect-square bg-pedie-border w-full' />
                <div className='p-4 flex flex-col gap-3'>
                  <div className='h-4 w-1/3 bg-pedie-border rounded' />
                  <div className='h-6 w-3/4 bg-pedie-border rounded' />
                  <div className='h-4 w-1/2 bg-pedie-border rounded' />
                  <div className='h-8 w-1/3 bg-pedie-border rounded mt-2' />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

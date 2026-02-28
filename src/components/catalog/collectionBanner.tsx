import Image from 'next/image'
import type { Category } from '@app-types/product'

interface CollectionBannerProps {
  category: Category
  listingCount: number
}

export function CollectionBanner({
  category,
  listingCount,
}: CollectionBannerProps) {
  return (
    <div className='relative w-full bg-pedie-dark overflow-hidden rounded-xl mb-8 border border-pedie-border'>
      <div className='absolute inset-0 bg-gradient-to-r from-pedie-dark via-pedie-dark/80 to-transparent z-10' />

      {category.image_url && (
        <div className='absolute inset-0 z-0 opacity-40'>
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className='object-cover object-center'
            priority
          />
        </div>
      )}

      <div className='relative z-20 p-8 md:p-12 flex flex-col justify-center min-h-[200px]'>
        <h1 className='text-3xl md:text-4xl font-bold text-white mb-4'>
          {category.name}
        </h1>
        {category.description && (
          <p className='text-pedie-text-muted max-w-2xl mb-4 text-lg'>
            {category.description}
          </p>
        )}
        <p className='text-pedie-accent font-medium'>
          {listingCount} {listingCount === 1 ? 'product' : 'products'} available
        </p>
      </div>
    </div>
  )
}

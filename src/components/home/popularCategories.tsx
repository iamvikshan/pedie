import { getCategories } from '@lib/data/categories'
import Image from 'next/image'
import Link from 'next/link'

export const CATEGORY_IMAGES: Record<string, string> = {
  smartphones: '/images/categories/smartphones.jpg',
  laptops: '/images/categories/laptops.jpg',
  tablets: '/images/categories/tablets.jpg',
  audio: '/images/categories/audio.jpg',
  wearables: '/images/categories/wearables.jpg',
  accessories: '/images/categories/accessories.jpg',
  phones: '/images/categories/smartphones.jpg',
  smartwatches: '/images/categories/wearables.jpg',
  gaming: '/images/categories/accessories.jpg',
  cameras: '/images/categories/accessories.jpg',
}

export async function PopularCategories() {
  const categories = await getCategories()

  if (!categories || categories.length === 0) {
    return null
  }

  const displayCategories = categories.slice(0, 6)

  return (
    <section className='py-16 w-full max-w-7xl mx-auto px-4 md:px-6'>
      <h2 className='text-2xl md:text-3xl font-bold text-pedie-text mb-8'>
        Popular Categories
      </h2>
      <div className='grid grid-cols-3 md:grid-cols-6 gap-4'>
        {displayCategories.map(category => (
          <Link
            key={category.id}
            href={`/collections/${category.slug}`}
            className='group flex flex-col items-center gap-3'
          >
            <div className='relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 border-pedie-border group-hover:ring-2 group-hover:ring-pedie-green transition-all'>
              {CATEGORY_IMAGES[category.slug] ? (
                <CategoryImage
                  src={CATEGORY_IMAGES[category.slug]}
                  name={category.name}
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-pedie-card'>
                  <span className='text-xs font-medium text-pedie-text-muted text-center px-1'>
                    {category.name}
                  </span>
                </div>
              )}
            </div>
            <span className='text-sm font-medium text-pedie-text text-center group-hover:text-pedie-green transition-colors'>
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function CategoryImage({ src, name }: { src: string; name: string }) {
  return (
    <Image
      src={src}
      alt={name}
      fill
      className='object-cover'
      sizes='(max-width: 768px) 80px, 96px'
    />
  )
}

import Link from 'next/link'
import { getCategories } from '@lib/data/categories'

const categoryIcons: Record<string, string> = {
  phones: '📱',
  laptops: '💻',
  tablets: '📟',
  audio: '🎧',
  wearables: '⌚',
  accessories: '🔌',
  gaming: '🎮',
  cameras: '📷',
}

export async function PopularCategories() {
  const categories = await getCategories()

  if (!categories || categories.length === 0) {
    return null
  }

  // Take top 6 categories
  const displayCategories = categories.slice(0, 6)

  return (
    <section className='py-16 container mx-auto px-4 md:px-6'>
      <h2 className='text-2xl md:text-3xl font-bold text-pedie-text mb-8'>
        Popular Categories
      </h2>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
        {displayCategories.map(category => (
          <Link
            key={category.id}
            href={`/collections/${category.slug}`}
            className='flex flex-col items-center justify-center p-6 rounded-xl bg-pedie-card border border-pedie-border hover:border-pedie-green transition-colors group'
          >
            <span className='text-4xl mb-3 group-hover:scale-110 transition-transform'>
              {categoryIcons[category.slug] || '📦'}
            </span>
            <span className='font-medium text-pedie-text text-center'>
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

import Link from 'next/link'
import { ProductCard } from '@components/ui/productCard'
import { getListingsByCategory } from '@lib/data/products'
import { getCategoryBySlug } from '@lib/data/categories'

interface CategoryShowcaseProps {
  categorySlug: string
  title: string
}

export async function CategoryShowcase({
  categorySlug,
  title,
}: CategoryShowcaseProps) {
  const [category, listings] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getListingsByCategory(categorySlug, 8),
  ])

  if (!category || !listings || listings.length === 0) return null

  return (
    <section className='py-16 container mx-auto px-4 md:px-6'>
      <div className='flex items-center justify-between mb-8'>
        <h2 className='text-2xl md:text-3xl font-bold text-pedie-text'>
          {title}
        </h2>
        <Link
          href={`/collections/${category.slug}`}
          className='text-sm font-medium text-pedie-green hover:underline'
        >
          View All &rarr;
        </Link>
      </div>

      <div className='flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x'>
        {listings.map(listing => (
          <div
            key={listing.id}
            className='min-w-[280px] max-w-[300px] snap-start'
          >
            <ProductCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  )
}

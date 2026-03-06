import { ProductFamilyCard } from '@components/ui/productFamilyCard'
import { getCategoryBySlug } from '@data/categories'
import { getProductFamiliesByCategory } from '@data/products'
import Link from 'next/link'
import {
  CategoryShowcaseWrapper,
  ViewAllArrow,
} from './categoryShowcaseWrapper'

interface CategoryShowcaseProps {
  categorySlug: string
  title: string
}

export async function CategoryShowcase({
  categorySlug,
  title,
}: CategoryShowcaseProps) {
  const [category, families] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getProductFamiliesByCategory(categorySlug, 8),
  ])

  if (!category || !families || families.length === 0) return null

  return (
    <CategoryShowcaseWrapper>
      <div className='w-full pedie-container'>
        <div className='flex items-center justify-between mb-8'>
          <h2 className='text-2xl md:text-3xl font-bold text-pedie-text'>
            {title}
          </h2>
          <Link
            href={`/collections/${category.slug}`}
            className='inline-flex items-center gap-1 text-sm font-medium text-pedie-green hover:underline'
          >
            View All
            <ViewAllArrow />
          </Link>
        </div>

        <div className='flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x'>
          {families.map(family => (
            <div
              key={family.product.id}
              className='min-w-[180px] max-w-[200px] snap-start'
            >
              <ProductFamilyCard family={family} />
            </div>
          ))}
        </div>
      </div>
    </CategoryShowcaseWrapper>
  )
}

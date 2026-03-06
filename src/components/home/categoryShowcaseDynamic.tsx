import { CategoryShowcase } from '@components/home/categoryShowcase'
import { CategoryShowcaseSkeleton } from '@components/home/categoryShowcaseSkeleton'
import { getTopLevelCategories } from '@data/categories'
import { Suspense } from 'react'

export async function CategoryShowcaseDynamic() {
  const categories = await getTopLevelCategories()

  if (!categories || categories.length === 0) return null

  return (
    <>
      {categories.map(cat => (
        <Suspense key={cat.id} fallback={<CategoryShowcaseSkeleton />}>
          <CategoryShowcase categorySlug={cat.slug} title={cat.name} />
        </Suspense>
      ))}
    </>
  )
}

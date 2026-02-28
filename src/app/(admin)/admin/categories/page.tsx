import { getAdminCategories } from '@lib/data/admin'
import { CategoriesClient } from './client'

export default async function AdminCategoriesPage() {
  const categoriesRaw = await getAdminCategories()

  const categories = categoriesRaw.map(c => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    sort_order: (c.sort_order as number) ?? 0,
    parent_id: (c.parent_id as string) ?? null,
    image_url: (c.image_url as string) ?? null,
  }))

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-semibold text-pedie-text'>Categories</h2>
      <CategoriesClient categories={categories} />
    </div>
  )
}

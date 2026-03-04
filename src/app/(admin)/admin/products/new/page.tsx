import { getAdminCategories } from '@data/admin'
import { NewProductClient } from './client'

export default async function NewProductPage() {
  const categoriesRaw = await getAdminCategories()

  const categories = categoriesRaw.map(c => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
  }))

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-semibold text-pedie-text'>
        Create New Product
      </h2>
      <div className='max-w-2xl rounded-lg border border-pedie-border bg-pedie-card p-6'>
        <NewProductClient categories={categories} />
      </div>
    </div>
  )
}

import { getAdminCategories } from '@data/admin'
import { createAdminClient } from '@lib/supabase/admin'
import { notFound } from 'next/navigation'
import { EditProductClient } from './client'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = createAdminClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to load product: ${error.message}`)
  }

  if (!product) {
    notFound()
  }

  const categoriesRaw = await getAdminCategories()
  const categories = categoriesRaw.map(c => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
  }))

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-semibold text-pedie-text'>Edit Product</h2>
      <div className='max-w-2xl rounded-lg border border-pedie-border bg-pedie-card p-6'>
        <EditProductClient
          product={product as unknown as Record<string, unknown>}
          categories={categories}
        />
      </div>
    </div>
  )
}

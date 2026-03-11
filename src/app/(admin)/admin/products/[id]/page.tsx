import { getAdminCategories } from '@data/admin'
import { getBrands } from '@lib/data/brands'
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
  const [{ data: product, error }, { data: primaryCategory }] =
    await Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      supabase
        .from('product_categories')
        .select('category_id')
        .eq('product_id', id)
        .eq('is_primary', true)
        .maybeSingle(),
    ])

  if (error) {
    throw new Error(`Failed to load product: ${error.message}`)
  }

  if (!product) {
    notFound()
  }

  const brands = await getBrands()
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
          product={{
            ...(product as unknown as Record<string, unknown>),
            category_id:
              (primaryCategory?.category_id as string | undefined) ?? null,
          }}
          brands={brands}
          categories={categories}
        />
      </div>
    </div>
  )
}

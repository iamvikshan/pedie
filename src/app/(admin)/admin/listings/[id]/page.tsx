import { getAdminProducts } from '@data/admin'
import { createAdminClient } from '@lib/supabase/admin'
import { notFound } from 'next/navigation'
import { EditListingClient } from './client'

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = createAdminClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (!listing) {
    notFound()
  }

  const result = await getAdminProducts({ limit: 1000 })
  const products =
    result && Array.isArray(result.data)
      ? result.data.map(p => ({
          id: p.id as string,
          brand: p.brand as string,
          model: p.model as string,
        }))
      : []

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-semibold text-pedie-text'>Edit Listing</h2>
      <div className='max-w-2xl rounded-lg border border-pedie-border bg-pedie-card p-6'>
        <EditListingClient
          listing={listing as unknown as Record<string, unknown>}
          products={products}
        />
      </div>
    </div>
  )
}

import { getAdminProducts } from '@data/admin'
import { NewListingClient } from './client'

export default async function NewListingPage() {
  const result = await getAdminProducts({ limit: 1000 })

  const products =
    result && Array.isArray(result.data)
      ? result.data.map(p => ({
          id: p.id as string,
          name: p.name as string,
          brand_id: p.brand_id as string,
        }))
      : []

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-semibold text-pedie-text'>
        Create New Listing
      </h2>
      <div className='max-w-2xl rounded-lg border border-pedie-border bg-pedie-card p-6'>
        <NewListingClient products={products} />
      </div>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { ListingForm } from '@components/admin/listing-form'

interface EditListingClientProps {
  listing: Record<string, unknown>
  products: Array<{ id: string; brand: string; model: string }>
}

export function EditListingClient({
  listing,
  products,
}: EditListingClientProps) {
  const router = useRouter()

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/listings/${listing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update listing')
    }

    router.push('/admin/listings')
    router.refresh()
  }

  return (
    <ListingForm
      initialData={listing as never}
      products={products}
      onSubmit={handleSubmit}
    />
  )
}

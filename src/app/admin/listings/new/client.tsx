'use client'

import { useRouter } from 'next/navigation'
import { ListingForm } from '@components/admin/listing-form'

interface NewListingClientProps {
  products: Array<{ id: string; brand: string; model: string }>
}

export function NewListingClient({ products }: NewListingClientProps) {
  const router = useRouter()

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/admin/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      let message = 'Failed to create listing'
      try {
        const err = await res.json()
        message = err.error || 'Failed to create listing'
      } catch {
        // Response was not JSON
      }
      throw new Error(message)
    }

    router.push('/admin/listings')
  }

  return <ListingForm products={products} onSubmit={handleSubmit} />
}

'use client'

import { useRouter } from 'next/navigation'
import { ProductForm } from '@components/admin/product-form'

interface NewProductClientProps {
  categories: Array<{ id: string; name: string; slug: string }>
}

export function NewProductClient({ categories }: NewProductClientProps) {
  const router = useRouter()

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      let message = 'Failed to create product'
      try {
        const err = await res.json()
        message = err.error || 'Failed to create product'
      } catch {
        // Response was not JSON
      }
      throw new Error(message)
    }

    router.push('/admin/products')
  }

  return <ProductForm categories={categories} onSubmit={handleSubmit} />
}

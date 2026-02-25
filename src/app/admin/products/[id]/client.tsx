'use client'

import { useRouter } from 'next/navigation'
import { ProductForm } from '@components/admin/product-form'

interface EditProductClientProps {
  product: Record<string, unknown>
  categories: Array<{ id: string; name: string; slug: string }>
}

export function EditProductClient({
  product,
  categories,
}: EditProductClientProps) {
  const router = useRouter()

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update product')
    }

    router.push('/admin/products')
    router.refresh()
  }

  return (
    <ProductForm
      initialData={product as never}
      categories={categories}
      onSubmit={handleSubmit}
    />
  )
}

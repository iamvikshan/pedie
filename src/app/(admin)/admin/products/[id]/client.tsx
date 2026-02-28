'use client'

import { useRouter } from 'next/navigation'
import { ProductForm } from '@components/admin/productForm'

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
      let message = 'Failed to update product'
      try {
        const err = await res.json()
        message = err.error || message
      } catch {
        message = (await res.text()) || message
      }
      throw new Error(message)
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@components/admin/data-table'
import { CategoryForm } from '@components/admin/category-form'
import { categoryColumns } from './columns'
import type { ColumnDef } from '@tanstack/react-table'

interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  parent_id: string | null
  image_url: string | null
}

interface CategoriesClientProps {
  categories: Category[]
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      let message = 'Failed to create category'
      try {
        const err = await res.json()
        message = err.error || 'Failed to create category'
      } catch {
        // Response was not JSON
      }
      throw new Error(message)
    }

    setShowForm(false)
    router.refresh()
  }

  return (
    <>
      <div className='flex justify-end'>
        <button
          type='button'
          onClick={() => setShowForm(!showForm)}
          className='rounded bg-pedie-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90'
        >
          {showForm ? 'Cancel' : '+ New Category'}
        </button>
      </div>
      {showForm && (
        <div className='max-w-xl rounded-lg border border-pedie-border bg-pedie-card p-6'>
          <CategoryForm categories={categories} onSubmit={handleSubmit} />
        </div>
      )}
      <DataTable
        columns={
          categoryColumns as ColumnDef<Record<string, unknown>, unknown>[]
        }
        data={categories as unknown as Record<string, unknown>[]}
      />
    </>
  )
}

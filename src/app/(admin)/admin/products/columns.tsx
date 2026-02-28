'use client'

import type { ColumnDef } from '@tanstack/react-table'

interface ProductRow {
  id: string
  brand: string
  model: string
  slug: string
  category: { name: string } | null
  created_at: string | null
  [key: string]: unknown
}

export const productColumns: ColumnDef<ProductRow, unknown>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type='checkbox'
        checked={table.getIsAllPageRowsSelected()}
        onChange={e => table.toggleAllPageRowsSelected(e.target.checked)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <input
        type='checkbox'
        checked={row.getIsSelected()}
        onChange={e => row.toggleSelected(e.target.checked)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'brand',
    header: 'Brand',
  },
  {
    accessorKey: 'model',
    header: 'Model',
  },
  {
    id: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.original.category
      return category ? category.name : '—'
    },
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => (
      <span className='font-mono text-xs text-pedie-muted'>
        {row.getValue('slug')}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string | null
      return date ? new Date(date).toLocaleDateString() : '—'
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className='flex gap-2'>
          <a
            href={`/admin/products/${product.id}`}
            className='text-sm text-pedie-primary hover:underline'
          >
            Edit
          </a>
          <button
            type='button'
            className='text-sm text-red-600 hover:underline'
            onClick={async () => {
              if (confirm('Delete this product?')) {
                try {
                  const response = await fetch(
                    `/api/admin/products/${product.id}`,
                    {
                      method: 'DELETE',
                    }
                  )
                  if (response.ok) {
                    window.location.reload()
                  } else {
                    alert('Failed to delete product')
                  }
                } catch (error) {
                  console.error('Delete product failed:', error)
                  alert('Network error deleting product')
                }
              }
            }}
          >
            Delete
          </button>
        </div>
      )
    },
    enableSorting: false,
  },
]

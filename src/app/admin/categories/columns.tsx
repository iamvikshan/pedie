'use client'

import type { ColumnDef } from '@tanstack/react-table'

interface CategoryRow {
  id: string
  name: string
  slug: string
  sort_order: number | null
  parent_id: string | null
  [key: string]: unknown
}

export const categoryColumns: ColumnDef<CategoryRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('name')}</span>
    ),
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
    accessorKey: 'sort_order',
    header: 'Sort Order',
    cell: ({ row }) => row.getValue('sort_order') ?? '—',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const category = row.original
      return (
        <div className='flex gap-2'>
          <a
            href={`/admin/categories/${category.id}`}
            className='text-sm text-pedie-primary hover:underline'
          >
            Edit
          </a>
          <button
            type='button'
            className='text-sm text-red-600 hover:underline'
            onClick={() => {
              if (confirm('Delete this category?')) {
                fetch(`/api/admin/categories/${category.id}`, {
                  method: 'DELETE',
                }).then(() => window.location.reload())
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

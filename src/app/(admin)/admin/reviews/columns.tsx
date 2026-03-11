'use client'

import type { ColumnDef } from '@tanstack/react-table'

interface ReviewRow {
  id: string
  product: { brand: { name: string } | null; name: string } | null
  profile: { full_name: string | null } | null
  rating: number
  title: string | null
  created_at: string | null
  [key: string]: unknown
}

function renderStars(rating: number): string {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)))
  return '★'.repeat(clamped) + '☆'.repeat(5 - clamped)
}

export const reviewColumns: ColumnDef<ReviewRow, unknown>[] = [
  {
    id: 'product',
    header: 'Product',
    cell: ({ row }) => {
      const product = row.original.product
      return product
        ? `${product.brand?.name ?? ''} ${product.name}`.trim() || '—'
        : '—'
    },
  },
  {
    id: 'user',
    header: 'User',
    cell: ({ row }) => row.original.profile?.full_name ?? '—',
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number
      return (
        <span className='text-yellow-500' title={`${rating}/5`}>
          {renderStars(rating)}
        </span>
      )
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (row.getValue('title') as string) ?? '—',
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string | null
      return date
        ? new Date(date).toLocaleDateString('en-KE', {
            timeZone: 'Africa/Nairobi',
          })
        : '—'
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const review = row.original
      return (
        <button
          type='button'
          className='text-sm text-red-600 hover:underline'
          onClick={async () => {
            if (confirm('Delete this review?')) {
              try {
                const res = await fetch(`/api/admin/reviews?id=${review.id}`, {
                  method: 'DELETE',
                })
                if (res.ok) {
                  window.location.reload()
                } else {
                  const data = await res.json().catch(() => ({}))
                  alert(data.error ?? 'Failed to delete review')
                }
              } catch (err) {
                alert(
                  err instanceof Error
                    ? err.message
                    : 'Network error deleting review'
                )
              }
            }
          }}
        >
          Delete
        </button>
      )
    },
    enableSorting: false,
  },
]

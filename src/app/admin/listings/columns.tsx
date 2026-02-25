'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { formatKes } from '@lib/constants'

interface ListingRow {
  id: string
  listing_id: string
  product_id: string
  product: { brand: string; model: string } | null
  condition: string
  price_kes: number
  status: string
  created_at: string | null
  [key: string]: unknown
}

export const listingColumns: ColumnDef<ListingRow, unknown>[] = [
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
    accessorKey: 'listing_id',
    header: 'Listing ID',
    cell: ({ row }) => (
      <span className='font-mono text-sm'>{row.getValue('listing_id')}</span>
    ),
  },
  {
    id: 'product',
    header: 'Product',
    cell: ({ row }) => {
      const product = row.original.product
      return product ? `${product.brand} ${product.model}` : '—'
    },
  },
  {
    accessorKey: 'condition',
    header: 'Condition',
    cell: ({ row }) => {
      const condition = row.getValue('condition') as string
      const colors: Record<string, string> = {
        premium: 'bg-green-100 text-green-800',
        excellent: 'bg-blue-100 text-blue-800',
        good: 'bg-yellow-100 text-yellow-800',
        acceptable: 'bg-gray-100 text-gray-800',
      }
      return (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[condition] ?? ''}`}
        >
          {condition}
        </span>
      )
    },
  },
  {
    accessorKey: 'price_kes',
    header: 'Price',
    cell: ({ row }) => formatKes(row.getValue('price_kes') as number),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const colors: Record<string, string> = {
        available: 'bg-green-100 text-green-800',
        reserved: 'bg-yellow-100 text-yellow-800',
        sold: 'bg-red-100 text-red-800',
        unlisted: 'bg-gray-100 text-gray-800',
      }
      return (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? ''}`}
        >
          {status}
        </span>
      )
    },
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
      const listing = row.original
      return (
        <div className='flex gap-2'>
          <a
            href={`/admin/listings/${listing.id}`}
            className='text-sm text-pedie-primary hover:underline'
          >
            Edit
          </a>
          <button
            type='button'
            className='text-sm text-red-600 hover:underline'
            onClick={async () => {
              if (confirm('Delete this listing?')) {
                const response = await fetch(
                  `/api/admin/listings/${listing.id}`,
                  {
                    method: 'DELETE',
                  }
                )
                if (response.ok) {
                  window.location.reload()
                } else {
                  alert('Failed to delete listing')
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

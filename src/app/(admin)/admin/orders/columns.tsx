'use client'

import { formatKes } from '@helpers'
import type { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'

interface OrderRow {
  id: string
  user_id: string
  profile: { full_name: string | null } | null
  status: string | null
  payment_method: string | null
  total_kes: number
  created_at: string | null
  [key: string]: unknown
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const orderColumns: ColumnDef<OrderRow, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      return (
        <span className='font-mono text-sm' title={id}>
          {id.slice(0, 8)}…
        </span>
      )
    },
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({ row }) => {
      const profile = row.original.profile
      return profile?.full_name ?? '—'
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = (row.getValue('status') as string) ?? 'pending'
      return (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[status] ?? ''}`}
        >
          {status}
        </span>
      )
    },
  },
  {
    accessorKey: 'payment_method',
    header: 'Payment',
    cell: ({ row }) => {
      const method = row.getValue('payment_method') as string | null
      return method ? method.toUpperCase() : '—'
    },
  },
  {
    accessorKey: 'total_kes',
    header: 'Total',
    cell: ({ row }) => formatKes(row.getValue('total_kes') as number),
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
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className='text-sm text-pedie-primary hover:underline'
      >
        View
      </Link>
    ),
    enableSorting: false,
  },
]

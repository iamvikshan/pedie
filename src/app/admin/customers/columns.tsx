'use client'

import type { ColumnDef } from '@tanstack/react-table'

interface CustomerRow {
  id: string
  full_name: string | null
  email?: string | null
  role: string | null
  phone: string | null
  created_at: string | null
  [key: string]: unknown
}

export const customerColumns: ColumnDef<CustomerRow, unknown>[] = [
  {
    accessorKey: 'full_name',
    header: 'Name',
    cell: ({ row }) => {
      return (row.getValue('full_name') as string) ?? '—'
    },
  },
  {
    accessorKey: 'id',
    header: 'User ID',
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
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = (row.getValue('role') as string) ?? 'customer'
      const colors: Record<string, string> = {
        admin: 'bg-purple-100 text-purple-800',
        customer: 'bg-blue-100 text-blue-800',
      }
      return (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[role] ?? ''}`}
        >
          {role}
        </span>
      )
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => (row.getValue('phone') as string) ?? '—',
  },
  {
    accessorKey: 'created_at',
    header: 'Joined',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string | null
      return date ? new Date(date).toLocaleDateString() : '—'
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <a
        href={`/admin/customers/${row.original.id}`}
        className='text-sm text-pedie-primary hover:underline'
      >
        View
      </a>
    ),
    enableSorting: false,
  },
]

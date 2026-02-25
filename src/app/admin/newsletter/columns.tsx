'use client'

import type { ColumnDef } from '@tanstack/react-table'

interface SubscriberRow {
  id: string
  email: string
  subscribed_at: string | null
  [key: string]: unknown
}

export const newsletterColumns: ColumnDef<SubscriberRow, unknown>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'subscribed_at',
    header: 'Subscribed At',
    cell: ({ row }) => {
      const date = row.getValue('subscribed_at') as string | null
      return date ? new Date(date).toLocaleDateString() : '—'
    },
  },
]

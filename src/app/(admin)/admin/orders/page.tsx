import { getAdminOrders } from '@lib/data/admin'
import { DataTableShell } from '@components/admin/dataTableShell'
import { orderColumns } from './columns'
import type { ColumnDef } from '@tanstack/react-table'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const status = typeof params.status === 'string' ? params.status : undefined
  const search = typeof params.search === 'string' ? params.search : undefined

  const result = await getAdminOrders({ status, search, page, limit })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-pedie-text'>Orders</h2>
      </div>
      <DataTableShell
        columns={orderColumns as ColumnDef<Record<string, unknown>, unknown>[]}
        data={result.data}
        currentPage={result.page}
        totalPages={result.totalPages}
        perPage={limit}
        searchPlaceholder='Search orders...'
        searchValue={search ?? ''}
      />
    </div>
  )
}

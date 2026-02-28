import { getAdminCustomers } from '@lib/data/admin'
import { DataTableShell } from '@components/admin/dataTableShell'
import { customerColumns } from './columns'
import type { ColumnDef } from '@tanstack/react-table'

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const search = typeof params.search === 'string' ? params.search : undefined
  const role = typeof params.role === 'string' ? params.role : undefined

  const result = await getAdminCustomers({ search, role, page, limit })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-pedie-text'>Customers</h2>
      </div>
      <DataTableShell
        columns={
          customerColumns as ColumnDef<Record<string, unknown>, unknown>[]
        }
        data={result.data}
        currentPage={result.page}
        totalPages={result.totalPages}
        perPage={limit}
        searchPlaceholder='Search customers...'
        searchValue={search ?? ''}
      />
    </div>
  )
}

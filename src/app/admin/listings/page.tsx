import Link from 'next/link'
import { getAdminListings } from '@lib/data/admin'
import { DataTableShell } from '@components/admin/data-table-shell'
import { listingColumns } from './columns'
import type { ColumnDef } from '@tanstack/react-table'

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const search = typeof params.search === 'string' ? params.search : undefined
  const status = typeof params.status === 'string' ? params.status : undefined
  const condition =
    typeof params.condition === 'string' ? params.condition : undefined

  const result = await getAdminListings({
    page,
    limit,
    search,
    status,
    condition,
  })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-pedie-text'>Listings</h2>
        <Link
          href='/admin/listings/new'
          className='rounded bg-pedie-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90'
        >
          + New Listing
        </Link>
      </div>
      <DataTableShell
        columns={
          listingColumns as ColumnDef<Record<string, unknown>, unknown>[]
        }
        data={result.data}
        currentPage={result.page}
        totalPages={result.totalPages}
        perPage={limit}
        searchPlaceholder='Search listings...'
        searchValue={search ?? ''}
      />
    </div>
  )
}

import { DataTableShell } from '@components/admin/dataTableShell'
import { getAdminProducts } from '@data/admin'
import type { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { productColumns } from './columns'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const search = typeof params.search === 'string' ? params.search : undefined
  const categoryId =
    typeof params.categoryId === 'string' ? params.categoryId : undefined

  const result = await getAdminProducts({ page, limit, search, categoryId })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-pedie-text'>Products</h2>
        <Link
          href='/admin/products/new'
          className='rounded bg-pedie-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90'
        >
          + New Product
        </Link>
      </div>
      <DataTableShell
        columns={
          productColumns as ColumnDef<Record<string, unknown>, unknown>[]
        }
        data={result.data}
        currentPage={result.page}
        totalPages={result.totalPages}
        perPage={limit}
        searchPlaceholder='Search products...'
        searchValue={search ?? ''}
      />
    </div>
  )
}

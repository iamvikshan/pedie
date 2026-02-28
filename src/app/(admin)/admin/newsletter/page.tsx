import { getNewsletterSubscribers } from '@lib/data/admin'
import { DataTableShell } from '@components/admin/dataTableShell'
import { newsletterColumns } from './columns'
import { NewsletterExportButton } from '@components/admin/newsletterExportButton'
import type { ColumnDef } from '@tanstack/react-table'

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const page = Math.max(1, Math.floor(Number(params.page) || 1))
  const limit = Math.max(
    1,
    Math.min(100, Math.floor(Number(params.limit) || 10))
  )

  const result = await getNewsletterSubscribers({ page, limit })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-pedie-text'>
          Newsletter Subscribers
        </h2>
        <NewsletterExportButton />
      </div>
      <DataTableShell
        columns={
          newsletterColumns as ColumnDef<Record<string, unknown>, unknown>[]
        }
        data={result.data}
        currentPage={result.page}
        totalPages={result.totalPages}
        perPage={limit}
        searchPlaceholder='Search subscribers...'
      />
    </div>
  )
}

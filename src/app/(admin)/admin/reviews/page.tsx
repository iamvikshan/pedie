import { DataTableShell } from '@components/admin/dataTableShell'
import { getAdminReviews } from '@data/admin'
import type { ColumnDef } from '@tanstack/react-table'
import { reviewColumns } from './columns'

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const ratingParam =
    typeof params.rating === 'string' ? params.rating : undefined
  const rawRating = ratingParam ? Number(ratingParam) : undefined
  const rating =
    rawRating !== undefined &&
    Number.isFinite(rawRating) &&
    Number.isInteger(rawRating) &&
    rawRating >= 1 &&
    rawRating <= 5
      ? rawRating
      : undefined

  const result = await getAdminReviews({ rating, page, limit })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-pedie-text'>Reviews</h2>
      </div>
      <DataTableShell
        columns={reviewColumns as ColumnDef<Record<string, unknown>, unknown>[]}
        data={result.data}
        currentPage={result.page}
        totalPages={result.totalPages}
        perPage={limit}
        searchPlaceholder='Search reviews...'
      />
    </div>
  )
}

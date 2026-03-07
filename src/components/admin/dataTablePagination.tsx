'use client'

interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

const perPageOptions = [10, 20, 50]

export function DataTablePagination({
  currentPage,
  totalPages,
  perPage,
  onPageChange,
  onPerPageChange,
}: DataTablePaginationProps) {
  return (
    <div className='flex items-center justify-between px-2 py-4'>
      <div className='flex items-center gap-2 text-sm text-pedie-text-muted'>
        <span>Rows per page</span>
        <select
          value={perPage}
          onChange={e => onPerPageChange(Number(e.target.value))}
          className='rounded border border-pedie-border bg-pedie-card px-2 py-1 text-pedie-text'
          aria-label='Rows per page'
        >
          {perPageOptions.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-pedie-text-muted'>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          type='button'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className='rounded border border-pedie-border px-3 py-1 text-sm text-pedie-text disabled:opacity-50'
          aria-label='Previous page'
        >
          Previous
        </button>
        <button
          type='button'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className='rounded border border-pedie-border px-3 py-1 text-sm text-pedie-text disabled:opacity-50'
          aria-label='Next page'
        >
          Next
        </button>
      </div>
    </div>
  )
}

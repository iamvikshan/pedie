'use client'

interface DataTableColumnHeaderProps {
  title: string
  sortKey?: string
  currentSort?: string
  currentDirection?: 'asc' | 'desc'
  onSort?: (key: string) => void
}

export function DataTableColumnHeader({
  title,
  sortKey,
  currentSort,
  currentDirection,
  onSort,
}: DataTableColumnHeaderProps) {
  const isSorted = sortKey && currentSort === sortKey

  return (
    <button
      type='button'
      className='flex items-center gap-1 font-medium text-pedie-muted hover:text-pedie-text'
      onClick={() => sortKey && onSort?.(sortKey)}
      disabled={!sortKey}
    >
      {title}
      {sortKey && (
        <span className='text-xs'>
          {isSorted ? (currentDirection === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      )}
    </button>
  )
}

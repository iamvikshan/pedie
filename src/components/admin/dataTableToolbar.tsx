'use client'

import { useState, useEffect } from 'react'

interface FilterOption {
  label: string
  value: string
}

interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
}

interface DataTableToolbarProps {
  searchValue: string
  searchPlaceholder?: string
  onSearchChange: (value: string) => void
  filters?: FilterConfig[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  selectedCount?: number
  bulkActions?: Array<{
    label: string
    onClick: () => void
  }>
}

export function DataTableToolbar({
  searchValue,
  searchPlaceholder = 'Search...',
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  selectedCount = 0,
  bulkActions,
}: DataTableToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)

  // Sync localSearch when the external searchValue prop changes
  useEffect(() => {
    setLocalSearch(searchValue)
  }, [searchValue])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, searchValue, onSearchChange])

  return (
    <div className='flex flex-wrap items-center gap-2 py-4'>
      <input
        type='text'
        placeholder={searchPlaceholder}
        value={localSearch}
        onChange={e => setLocalSearch(e.target.value)}
        className='rounded border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text placeholder:text-pedie-muted'
        aria-label='Search'
      />
      {filters?.map(filter => (
        <select
          key={filter.key}
          value={filterValues?.[filter.key] ?? ''}
          onChange={e => onFilterChange?.(filter.key, e.target.value)}
          className='rounded border border-pedie-border bg-pedie-card px-2 py-2 text-sm text-pedie-text'
          aria-label={filter.label}
        >
          <option value=''>{filter.label}</option>
          {filter.options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
      {selectedCount > 0 && bulkActions && (
        <div className='ml-auto flex items-center gap-2'>
          <span className='text-sm text-pedie-muted'>
            {selectedCount} selected
          </span>
          {bulkActions.map(action => (
            <button
              key={action.label}
              type='button'
              onClick={action.onClick}
              className='rounded bg-pedie-primary px-3 py-1.5 text-sm text-white hover:opacity-90'
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

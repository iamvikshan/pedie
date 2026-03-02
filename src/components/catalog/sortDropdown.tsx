'use client'

import type { SortOption } from '@app-types/filters'
import { useRouter, useSearchParams } from 'next/navigation'

interface SortDropdownProps {
  currentSort: SortOption
  categorySlug: string
}

export function SortDropdown({ currentSort, categorySlug }: SortDropdownProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as SortOption
    const params = new URLSearchParams(searchParams.toString())

    if (newSort === 'newest') {
      params.delete('sort')
    } else {
      params.set('sort', newSort)
    }

    // Reset page when sorting changes
    params.delete('page')

    router.push(`/collections/${categorySlug}?${params.toString()}`)
  }

  return (
    <div className='flex items-center gap-2'>
      <label
        htmlFor='sort'
        className='text-sm font-medium text-pedie-text-muted'
      >
        Sort by:
      </label>
      <div className='relative'>
        <select
          id='sort'
          value={currentSort}
          onChange={handleSortChange}
          className='appearance-none bg-pedie-card border border-pedie-border text-pedie-text text-sm rounded-md focus:ring-pedie-accent focus:border-pedie-accent block w-full p-2.5 pr-8 cursor-pointer'
        >
          <option value='newest'>Newest Arrivals</option>
          <option value='price-asc'>Price: Low to High</option>
          <option value='price-desc'>Price: High to Low</option>
        </select>
        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-pedie-text-muted'>
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

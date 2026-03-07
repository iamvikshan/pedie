'use client'

import type { SortOption } from '@app-types/filters'
import { Select } from '@components/ui/select'
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

    const basePath = categorySlug ? `/collections/${categorySlug}` : '/shop'
    router.push(`${basePath}?${params.toString()}`)
  }

  return (
    <div className='flex items-center gap-2'>
      <label
        htmlFor='sort'
        className='text-sm font-medium text-pedie-text-muted'
      >
        Sort by:
      </label>
      <Select id='sort' value={currentSort} onChange={handleSortChange}>
        <option value='newest'>Newest Arrivals</option>
        <option value='price-asc'>Price: Low to High</option>
        <option value='price-desc'>Price: High to Low</option>
      </Select>
    </div>
  )
}

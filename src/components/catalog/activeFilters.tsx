'use client'

import type { ListingFilters } from '@app-types/filters'
import { Badge } from '@components/ui/badge'
import { useRouter, useSearchParams } from 'next/navigation'
import { TbX } from 'react-icons/tb'

interface ActiveFiltersProps {
  currentFilters: ListingFilters
  categorySlug: string
}

export function ActiveFilters({
  currentFilters,
  categorySlug,
}: ActiveFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const hasFilters = Object.values(currentFilters).some(v =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  )
  if (!hasFilters) return null

  const removeFilter = (key: string, valueToRemove?: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (valueToRemove) {
      const currentValues = params.get(key)?.split(',') || []
      const newValues = currentValues.filter(v => v !== valueToRemove)

      if (newValues.length > 0) {
        params.set(key, newValues.join(','))
      } else {
        params.delete(key)
      }
    } else {
      params.delete(key)
    }

    params.delete('page')
    const basePath = categorySlug ? `/collections/${categorySlug}` : '/shop'
    router.push(`${basePath}?${params.toString()}`)
  }

  const clearAll = () => {
    router.push(categorySlug ? `/collections/${categorySlug}` : '/shop')
  }

  const renderFilterBadge = (
    key: string,
    value: string,
    label: string,
    ariaLabel: string
  ) => (
    <Badge
      key={`${key}-${value}`}
      variant='default'
      size='lg'
      className='gap-1 border border-pedie-border bg-pedie-card text-sm font-normal'
    >
      <span>{label}</span>
      <button
        type='button'
        onClick={() => removeFilter(key, value)}
        className='ml-1 text-pedie-text-muted hover:text-pedie-accent'
        aria-label={ariaLabel}
      >
        <TbX className='h-3 w-3' aria-hidden='true' />
      </button>
    </Badge>
  )

  return (
    <div className='flex flex-wrap items-center gap-2 mb-6'>
      <span className='text-sm text-pedie-text-muted mr-2'>
        Active Filters:
      </span>

      {currentFilters.condition?.map(condition =>
        renderFilterBadge(
          'condition',
          condition,
          condition.charAt(0).toUpperCase() + condition.slice(1),
          `Remove condition filter: ${condition}`
        )
      )}

      {currentFilters.brand?.map(brand =>
        renderFilterBadge(
          'brand',
          brand,
          brand,
          `Remove brand filter: ${brand}`
        )
      )}

      {currentFilters.storage?.map(storage =>
        renderFilterBadge(
          'storage',
          storage,
          storage,
          `Remove storage filter: ${storage}`
        )
      )}

      {currentFilters.color?.map(color =>
        renderFilterBadge(
          'color',
          color,
          color,
          `Remove color filter: ${color}`
        )
      )}

      {currentFilters.category?.map(category =>
        renderFilterBadge(
          'category',
          category,
          category.charAt(0).toUpperCase() + category.slice(1),
          `Remove category filter: ${category}`
        )
      )}
      {(currentFilters.priceMin !== undefined ||
        currentFilters.priceMax !== undefined) && (
        <Badge
          variant='default'
          size='lg'
          className='gap-1 border border-pedie-border bg-pedie-card text-sm font-normal'
        >
          <span>
            {currentFilters.priceMin ? `KES ${currentFilters.priceMin}` : '0'} -{' '}
            {currentFilters.priceMax ? `KES ${currentFilters.priceMax}` : 'Any'}
          </span>
          <button
            type='button'
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.delete('priceMin')
              params.delete('priceMax')
              params.delete('page')
              const basePath = categorySlug
                ? `/collections/${categorySlug}`
                : '/shop'
              router.push(`${basePath}?${params.toString()}`)
            }}
            aria-label='Remove price range filter'
            className='text-pedie-text-muted hover:text-pedie-accent ml-1'
          >
            <TbX className='h-3 w-3' aria-hidden='true' />
          </button>
        </Badge>
      )}

      <button
        onClick={clearAll}
        className='text-sm text-pedie-accent hover:underline ml-2'
      >
        Clear all
      </button>
    </div>
  )
}

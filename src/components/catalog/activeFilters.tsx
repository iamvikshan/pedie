'use client'

import type { ListingFilters } from '@app-types/filters'
import { useRouter, useSearchParams } from 'next/navigation'

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

  return (
    <div className='flex flex-wrap items-center gap-2 mb-6'>
      <span className='text-sm text-pedie-text-muted mr-2'>
        Active Filters:
      </span>

      {currentFilters.condition?.map(condition => (
        <span
          key={`condition-${condition}`}
          className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pedie-card border border-pedie-border text-sm text-pedie-text'
        >
          <span className='capitalize'>{condition}</span>
          <button
            onClick={() => removeFilter('condition', condition)}
            className='text-pedie-text-muted hover:text-pedie-accent ml-1'
            aria-label={`Remove condition filter: ${condition}`}
          >
            <svg
              className='w-3 h-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </span>
      ))}

      {currentFilters.brand?.map(brand => (
        <span
          key={`brand-${brand}`}
          className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pedie-card border border-pedie-border text-sm text-pedie-text'
        >
          <span>{brand}</span>
          <button
            onClick={() => removeFilter('brand', brand)}
            className='text-pedie-text-muted hover:text-pedie-accent ml-1'
            aria-label={`Remove brand filter: ${brand}`}
          >
            <svg
              className='w-3 h-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </span>
      ))}

      {currentFilters.storage?.map(storage => (
        <span
          key={`storage-${storage}`}
          className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pedie-card border border-pedie-border text-sm text-pedie-text'
        >
          <span>{storage}</span>
          <button
            onClick={() => removeFilter('storage', storage)}
            className='text-pedie-text-muted hover:text-pedie-accent ml-1'
            aria-label={`Remove storage filter: ${storage}`}
          >
            <svg
              className='w-3 h-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </span>
      ))}

      {currentFilters.color?.map(color => (
        <span
          key={`color-${color}`}
          className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pedie-card border border-pedie-border text-sm text-pedie-text'
        >
          <span>{color}</span>
          <button
            onClick={() => removeFilter('color', color)}
            className='text-pedie-text-muted hover:text-pedie-accent ml-1'
            aria-label={`Remove color filter: ${color}`}
          >
            <svg
              className='w-3 h-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </span>
      ))}
      {currentFilters.carrier?.map(carrier => (
        <span
          key={`carrier-${carrier}`}
          className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pedie-card border border-pedie-border text-sm text-pedie-text'
        >
          <span>{carrier}</span>
          <button
            onClick={() => removeFilter('carrier', carrier)}
            className='text-pedie-text-muted hover:text-pedie-accent ml-1'
            aria-label={`Remove carrier filter: ${carrier}`}
          >
            <svg
              className='w-3 h-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </span>
      ))}

      {currentFilters.category?.map(category => (
        <span
          key={`category-${category}`}
          className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pedie-card border border-pedie-border text-sm text-pedie-text'
        >
          <span className='capitalize'>{category}</span>
          <button
            onClick={() => removeFilter('category', category)}
            className='text-pedie-text-muted hover:text-pedie-accent ml-1'
            aria-label={`Remove category filter: ${category}`}
          >
            <svg
              className='w-3 h-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </span>
      ))}
      {(currentFilters.priceMin !== undefined ||
        currentFilters.priceMax !== undefined) && (
        <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pedie-card border border-pedie-border text-sm text-pedie-text'>
          <span>
            {currentFilters.priceMin ? `KES ${currentFilters.priceMin}` : '0'} -{' '}
            {currentFilters.priceMax ? `KES ${currentFilters.priceMax}` : 'Any'}
          </span>
          <button
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
            <svg
              className='w-3 h-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </span>
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

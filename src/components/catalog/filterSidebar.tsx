'use client'

import type { AvailableFilters, ListingFilters } from '@app-types/filters'
import { Button } from '@components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

interface FilterSidebarProps {
  availableFilters: AvailableFilters
  currentFilters: ListingFilters
  categorySlug: string
}

function FilterSidebarInner({
  availableFilters,
  currentFilters,
  categorySlug,
}: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: string, value: string | number | string[]) => {
    const params = new URLSearchParams(searchParams.toString())

    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','))
      } else {
        params.delete(key)
      }
    } else if (value !== undefined && value !== '') {
      params.set(key, value.toString())
    } else {
      params.delete(key)
    }

    // Reset page when filters change
    params.delete('page')

    router.push(`/collections/${categorySlug}?${params.toString()}`)
  }

  type ArrayFilterKey = 'condition' | 'storage' | 'color' | 'carrier' | 'brand'
  const handleCheckboxChange = (key: ArrayFilterKey, value: string) => {
    const currentValues = currentFilters[key] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]

    updateFilter(key, newValues)
  }

  const handlePriceChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const min = formData.get('priceMin') as string
    const max = formData.get('priceMax') as string

    const params = new URLSearchParams(searchParams.toString())
    if (min) params.set('priceMin', min)
    else params.delete('priceMin')

    if (max) params.set('priceMax', max)
    else params.delete('priceMax')

    params.delete('page')
    router.push(`/collections/${categorySlug}?${params.toString()}`)
  }

  return (
    <>
      {/* Mobile toggle button */}
      <div className='lg:hidden mb-4'>
        <Button
          variant='secondary'
          className='w-full flex items-center justify-center gap-2'
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
            />
          </svg>
          {isOpen ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Sidebar content */}
      <div
        className={`lg:block ${isOpen ? 'block' : 'hidden'} space-y-6 bg-pedie-card p-6 rounded-xl border border-pedie-border`}
      >
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-bold text-pedie-text'>Filters</h2>
          {Object.keys(currentFilters).length > 0 && (
            <button
              onClick={() => router.push(`/collections/${categorySlug}`)}
              className='text-sm text-pedie-accent hover:underline'
            >
              Clear all
            </button>
          )}
        </div>

        {/* Condition Filter */}
        {availableFilters.conditions.length > 0 && (
          <div className='border-t border-pedie-border pt-4'>
            <h3 className='font-semibold text-pedie-text mb-3'>Condition</h3>
            <div className='space-y-2'>
              {availableFilters.conditions.map(condition => (
                <label
                  key={condition}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    checked={(currentFilters.condition || []).includes(
                      condition
                    )}
                    onChange={() =>
                      handleCheckboxChange('condition', condition)
                    }
                    className='w-4 h-4 rounded border-pedie-border bg-pedie-dark text-pedie-accent focus:ring-pedie-accent'
                  />
                  <span className='text-pedie-text-muted capitalize'>
                    {condition}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Brand Filter */}
        {availableFilters.brands.length > 0 && (
          <div className='border-t border-pedie-border pt-4'>
            <h3 className='font-semibold text-pedie-text mb-3'>Brand</h3>
            <div className='space-y-2'>
              {availableFilters.brands.map(brand => (
                <label
                  key={brand}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    checked={(currentFilters.brand || []).includes(brand)}
                    onChange={() => handleCheckboxChange('brand', brand)}
                    className='w-4 h-4 rounded border-pedie-border bg-pedie-dark text-pedie-accent focus:ring-pedie-accent'
                  />
                  <span className='text-pedie-text-muted'>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Storage Filter */}
        {availableFilters.storages.length > 0 && (
          <div className='border-t border-pedie-border pt-4'>
            <h3 className='font-semibold text-pedie-text mb-3'>Storage</h3>
            <div className='space-y-2'>
              {availableFilters.storages.map(storage => (
                <label
                  key={storage}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    checked={(currentFilters.storage || []).includes(storage)}
                    onChange={() => handleCheckboxChange('storage', storage)}
                    className='w-4 h-4 rounded border-pedie-border bg-pedie-dark text-pedie-accent focus:ring-pedie-accent'
                  />
                  <span className='text-pedie-text-muted'>{storage}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Color Filter */}
        {availableFilters.colors.length > 0 && (
          <div className='border-t border-pedie-border pt-4'>
            <h3 className='font-semibold text-pedie-text mb-3'>Color</h3>
            <div className='space-y-2'>
              {availableFilters.colors.map(color => (
                <label
                  key={color}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    checked={(currentFilters.color || []).includes(color)}
                    onChange={() => handleCheckboxChange('color', color)}
                    className='w-4 h-4 rounded border-pedie-border bg-pedie-dark text-pedie-accent focus:ring-pedie-accent'
                  />
                  <span className='text-pedie-text-muted'>{color}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Filter */}
        <div className='border-t border-pedie-border pt-4'>
          <h3 className='font-semibold text-pedie-text mb-3'>
            Price Range (KES)
          </h3>
          <form
            onSubmit={handlePriceChange}
            className='flex items-center gap-2'
          >
            <input
              type='number'
              name='priceMin'
              placeholder='Min'
              min='0'
              defaultValue={currentFilters.priceMin}
              className='w-full px-3 py-2 bg-pedie-dark border border-pedie-border rounded-md text-pedie-text focus:outline-none focus:border-pedie-accent'
            />
            <span className='text-pedie-text-muted'>-</span>
            <input
              type='number'
              name='priceMax'
              placeholder='Max'
              min='0'
              defaultValue={currentFilters.priceMax}
              className='w-full px-3 py-2 bg-pedie-dark border border-pedie-border rounded-md text-pedie-text focus:outline-none focus:border-pedie-accent'
            />
            <Button
              type='submit'
              size='sm'
              variant='secondary'
              className='px-2'
              aria-label='Apply price filter'
            >
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
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}

export function FilterSidebar(props: FilterSidebarProps) {
  return (
    <Suspense>
      <FilterSidebarInner {...props} />
    </Suspense>
  )
}

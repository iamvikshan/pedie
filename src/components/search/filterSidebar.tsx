'use client'

import type { AvailableFilters, ListingFilters } from '@app-types/filters'
import type { ConditionGrade } from '@app-types/product'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { TbFilter, TbX } from 'react-icons/tb'

interface FilterSidebarProps {
  filters: AvailableFilters
  query: string
}

export function FilterSidebar({ filters, query }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [localPriceMin, setLocalPriceMin] = useState(
    searchParams.get('priceMin') ?? ''
  )
  const [localPriceMax, setLocalPriceMax] = useState(
    searchParams.get('priceMax') ?? ''
  )

  const currentFilters: ListingFilters = {
    condition: searchParams.getAll('condition') as ConditionGrade[],
    brand: searchParams.getAll('brand'),
    storage: searchParams.getAll('storage'),
    priceMin: searchParams.get('priceMin')
      ? Number(searchParams.get('priceMin'))
      : undefined,
    priceMax: searchParams.get('priceMax')
      ? Number(searchParams.get('priceMax'))
      : undefined,
  }

  const applyFilters = useCallback(
    (newFilters: ListingFilters) => {
      const params = new URLSearchParams()
      params.set('q', query)
      if (newFilters.condition?.length) {
        newFilters.condition.forEach(c => params.append('condition', c))
      }
      if (newFilters.brand?.length) {
        newFilters.brand.forEach(b => params.append('brand', b))
      }
      if (newFilters.storage?.length) {
        newFilters.storage.forEach(s => params.append('storage', s))
      }
      if (newFilters.priceMin !== undefined) {
        params.set('priceMin', String(newFilters.priceMin))
      }
      if (newFilters.priceMax !== undefined) {
        params.set('priceMax', String(newFilters.priceMax))
      }
      router.push(`/search?${params.toString()}`)
    },
    [query, router]
  )

  const toggleFilter = (key: keyof ListingFilters, value: string) => {
    const current = (currentFilters[key] as string[]) || []
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    applyFilters({ ...currentFilters, [key]: next })
  }

  const clearAll = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const hasActiveFilters =
    (currentFilters.condition?.length ?? 0) > 0 ||
    (currentFilters.brand?.length ?? 0) > 0 ||
    (currentFilters.storage?.length ?? 0) > 0 ||
    currentFilters.priceMin !== undefined ||
    currentFilters.priceMax !== undefined

  const filterContent = (
    <div className='space-y-6'>
      {/* Condition */}
      {filters.conditions.length > 0 && (
        <div>
          <h3 className='text-sm font-semibold text-pedie-text mb-3'>
            Condition
          </h3>
          <div className='space-y-2'>
            {filters.conditions.map(c => (
              <label
                key={c}
                className='flex items-center gap-2 cursor-pointer text-sm'
              >
                <input
                  type='checkbox'
                  checked={currentFilters.condition?.includes(c) ?? false}
                  onChange={() => toggleFilter('condition', c)}
                  className='rounded border-pedie-border text-pedie-green focus:ring-pedie-green'
                />
                <span className='capitalize text-pedie-text'>{c}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Brand */}
      {filters.brands.length > 0 && (
        <div>
          <h3 className='text-sm font-semibold text-pedie-text mb-3'>Brand</h3>
          <div className='space-y-2'>
            {filters.brands.map(b => (
              <label
                key={b}
                className='flex items-center gap-2 cursor-pointer text-sm'
              >
                <input
                  type='checkbox'
                  checked={currentFilters.brand?.includes(b) ?? false}
                  onChange={() => toggleFilter('brand', b)}
                  className='rounded border-pedie-border text-pedie-green focus:ring-pedie-green'
                />
                <span className='text-pedie-text'>{b}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Storage */}
      {filters.storages.length > 0 && (
        <div>
          <h3 className='text-sm font-semibold text-pedie-text mb-3'>
            Storage
          </h3>
          <div className='space-y-2'>
            {filters.storages.map(s => (
              <label
                key={s}
                className='flex items-center gap-2 cursor-pointer text-sm'
              >
                <input
                  type='checkbox'
                  checked={currentFilters.storage?.includes(s) ?? false}
                  onChange={() => toggleFilter('storage', s)}
                  className='rounded border-pedie-border text-pedie-green focus:ring-pedie-green'
                />
                <span className='text-pedie-text'>{s}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      {filters.priceRange.max > 0 && (
        <div>
          <h3 className='text-sm font-semibold text-pedie-text mb-3'>
            Price Range (KES)
          </h3>
          <div className='flex items-center gap-2'>
            <input
              type='number'
              placeholder='Min'
              value={localPriceMin}
              onChange={e => setLocalPriceMin(e.target.value)}
              onBlur={() => {
                const val = localPriceMin ? Number(localPriceMin) : undefined
                applyFilters({ ...currentFilters, priceMin: val })
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = localPriceMin ? Number(localPriceMin) : undefined
                  applyFilters({ ...currentFilters, priceMin: val })
                }
              }}
              className='w-full rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text'
              min={0}
            />
            <span className='text-pedie-text-muted'>—</span>
            <input
              type='number'
              placeholder='Max'
              value={localPriceMax}
              onChange={e => setLocalPriceMax(e.target.value)}
              onBlur={() => {
                const val = localPriceMax ? Number(localPriceMax) : undefined
                applyFilters({ ...currentFilters, priceMax: val })
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = localPriceMax ? Number(localPriceMax) : undefined
                  applyFilters({ ...currentFilters, priceMax: val })
                }
              }}
              className='w-full rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text'
              min={0}
            />
          </div>
          <p className='mt-1 text-xs text-pedie-text-muted'>
            Range: KES {filters.priceRange.min.toLocaleString()} —{' '}
            {filters.priceRange.max.toLocaleString()}
          </p>
        </div>
      )}

      {/* Clear All */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className='w-full rounded-lg border border-pedie-border px-4 py-2 text-sm font-medium text-pedie-text hover:bg-pedie-border/50 transition-colors'
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 rounded-lg border border-pedie-border bg-pedie-card px-4 py-2 text-sm font-medium text-pedie-text hover:bg-pedie-border/50 transition-colors lg:hidden'
      >
        <TbFilter className='h-4 w-4' />
        Filters
        {hasActiveFilters && (
          <span className='flex h-5 w-5 items-center justify-center rounded-full bg-pedie-green text-xs text-white'>
            {(currentFilters.condition?.length ?? 0) +
              (currentFilters.brand?.length ?? 0) +
              (currentFilters.storage?.length ?? 0) +
              (currentFilters.priceMin !== undefined ? 1 : 0) +
              (currentFilters.priceMax !== undefined ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Mobile drawer */}
      {isOpen && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div
            className='absolute inset-0 bg-black/50'
            onClick={() => setIsOpen(false)}
          />
          <div className='absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-pedie-bg p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-semibold text-pedie-text'>Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className='rounded-full p-1 hover:bg-pedie-border transition-colors'
                aria-label='Close filters'
              >
                <TbX className='h-5 w-5 text-pedie-text' />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className='hidden lg:block w-64 shrink-0'>
        <div className='sticky top-24 rounded-xl border border-pedie-border bg-pedie-card p-5'>
          <h2 className='text-sm font-semibold text-pedie-text mb-4'>
            Filters
          </h2>
          {filterContent}
        </div>
      </aside>
    </>
  )
}

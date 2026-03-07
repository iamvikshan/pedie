'use client'

import { Input } from '@components/ui/input'

interface CheckboxFilterGroupProps {
  title: string
  options: { value: string; label: string; count?: number }[]
  selected: string[]
  onChange: (value: string) => void
}

export function CheckboxFilterGroup({
  title,
  options,
  selected,
  onChange,
}: CheckboxFilterGroupProps) {
  return (
    <div>
      <h3 className='mb-2 text-sm font-semibold text-pedie-text'>{title}</h3>
      <div className='space-y-1.5'>
        {options.map(option => (
          <label
            key={option.value}
            className='flex cursor-pointer items-center gap-2 text-sm text-pedie-text'
          >
            <input
              type='checkbox'
              checked={selected.includes(option.value)}
              onChange={() => onChange(option.value)}
              className='rounded border-pedie-border text-pedie-green focus:ring-pedie-green'
            />
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span className='text-pedie-text-muted'>({option.count})</span>
            )}
          </label>
        ))}
      </div>
    </div>
  )
}

interface PriceRangeFilterProps {
  min: string
  max: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
}

export function PriceRangeFilter({
  min,
  max,
  onMinChange,
  onMaxChange,
}: PriceRangeFilterProps) {
  return (
    <div>
      <h3 className='mb-2 text-sm font-semibold text-pedie-text'>
        Price Range
      </h3>
      <div className='flex items-center gap-2'>
        <Input
          type='number'
          placeholder='Min'
          value={min}
          onChange={e => onMinChange(e.target.value)}
          size='sm'
        />
        <span className='text-pedie-text-muted'>-</span>
        <Input
          type='number'
          placeholder='Max'
          value={max}
          onChange={e => onMaxChange(e.target.value)}
          size='sm'
        />
      </div>
    </div>
  )
}

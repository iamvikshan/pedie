'use client'

import React from 'react'
import {
  TbCrown,
  TbDiamond,
  TbThumbUp,
  TbCircleCheck,
  TbSparkles,
  TbTool,
} from 'react-icons/tb'
import { formatKes } from '@helpers'
import type { Listing, ConditionGrade } from '../../../types/product'

type VariantDimension = 'storage' | 'color' | 'condition'

interface VariantSelectorProps {
  listings: Listing[]
  selectedListing: Listing
  onSelect?: (listing: Listing) => void
  disabled?: boolean
}

export function findBestMatch(
  listings: Listing[],
  current: Listing,
  dimension: VariantDimension,
  value: string
): Listing {
  const available = listings.filter(
    l => l.status !== 'sold' && l.status !== 'reserved'
  )
  if (available.length === 0) return current

  const matchingValue = available.filter(
    l => l[dimension as keyof Listing] === value
  )
  if (matchingValue.length === 0) return current

  // Score match
  let bestScore = -1
  let bestMatches: Listing[] = []

  for (const listing of matchingValue) {
    let score = 0
    if (listing.storage === current.storage && dimension !== 'storage') score++
    if (listing.color === current.color && dimension !== 'color') score++
    if (listing.condition === current.condition && dimension !== 'condition')
      score++

    if (score > bestScore) {
      bestScore = score
      bestMatches = [listing]
    } else if (score === bestScore) {
      bestMatches.push(listing)
    }
  }

  if (bestMatches.length === 1) return bestMatches[0]

  return bestMatches.sort(
    (a, b) =>
      (a.sale_price_kes ?? a.price_kes) - (b.sale_price_kes ?? b.price_kes)
  )[0]
}

const CONDITION_ICONS: Record<ConditionGrade, React.ElementType> = {
  new: TbSparkles,
  premium: TbCrown,
  excellent: TbDiamond,
  good: TbThumbUp,
  acceptable: TbCircleCheck,
  for_parts: TbTool,
}

const CONDITION_COLORS: Record<ConditionGrade, string> = {
  new: 'text-pedie-badge-new',
  premium: 'text-pedie-badge-premium',
  excellent: 'text-pedie-badge-excellent',
  good: 'text-pedie-badge-good',
  acceptable: 'text-pedie-badge-acceptable',
  for_parts: 'text-pedie-badge-for-parts',
}

/** Map known color names to hex for visual swatches */
const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#22c55e',
  gold: '#f59e0b',
  silver: '#c0c0c0',
  gray: '#6b7280',
  grey: '#6b7280',
  pink: '#ec4899',
  purple: '#a855f7',
  'space black': '#1a1a2e',
  'space gray': '#4a4a5a',
  'space grey': '#4a4a5a',
  'desert titanium': '#b5a38a',
  'natural titanium': '#c4b8a8',
  'blue titanium': '#4a6fa5',
  'black titanium': '#2d2d2d',
  'titanium black': '#2d2d2d',
  'titanium gray': '#7a7a7a',
  'titanium grey': '#7a7a7a',
  midnight: '#1c1c3a',
  starlight: '#f5e6d3',
  obsidian: '#1a1a1a',
  hazel: '#8b7355',
  coral: '#ff7f7f',
  'product red': '#ef4444',
}

function getColorHex(colorName: string): string | null {
  return COLOR_MAP[colorName.toLowerCase()] ?? null
}

export default function VariantSelector({
  listings,
  selectedListing,
  onSelect,
  disabled = false,
}: VariantSelectorProps) {
  const availableListings = listings.filter(
    l => l.status !== 'sold' && l.status !== 'reserved'
  )

  const storages = Array.from(
    new Set(availableListings.map(l => l.storage).filter(Boolean))
  ) as string[]
  const colors = Array.from(
    new Set(availableListings.map(l => l.color).filter(Boolean))
  ) as string[]
  const conditions = Array.from(
    new Set(availableListings.map(l => l.condition).filter(Boolean))
  ) as ConditionGrade[]

  const handleSelect = (dimension: VariantDimension, value: string) => {
    if (disabled || !onSelect) return
    const bestMatch = findBestMatch(
      availableListings,
      selectedListing,
      dimension,
      value
    )
    if (bestMatch && bestMatch.id !== selectedListing.id) {
      onSelect(bestMatch)
    }
  }

  return (
    <div className='space-y-6' role='group' aria-label='Variant options'>
      {storages.length > 1 && (
        <div>
          <h3 className='text-sm font-medium text-pedie-text-muted mb-2'>
            Storage
          </h3>
          <div
            className='flex flex-wrap gap-2'
            role='radiogroup'
            aria-label='Storage'
          >
            {storages.map(storage => {
              const isSelected = selectedListing.storage === storage
              return (
                <button
                  key={storage}
                  onClick={() => handleSelect('storage', storage)}
                  disabled={disabled}
                  aria-disabled={disabled}
                  aria-pressed={isSelected}
                  className={`px-4 py-2 rounded-full text-sm font-medium border glass transition-colors ${
                    isSelected
                      ? 'border-pedie-green bg-pedie-green/10 text-pedie-green'
                      : 'border-pedie-border text-pedie-text hover:border-pedie-green/50'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {storage}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {colors.length > 1 && (
        <div>
          <h3 className='text-sm font-medium text-pedie-text-muted mb-2'>
            Color
          </h3>
          <div
            className='flex flex-wrap gap-3'
            role='radiogroup'
            aria-label='Color'
          >
            {colors.map(color => {
              const isSelected = selectedListing.color === color
              const hex = getColorHex(color)
              return (
                <button
                  key={color}
                  onClick={() => handleSelect('color', color)}
                  disabled={disabled}
                  aria-disabled={disabled}
                  aria-pressed={isSelected}
                  aria-label={color}
                  title={color}
                  className={`group relative flex flex-col items-center gap-1 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {/* Color swatch circle */}
                  <span
                    className={`w-8 h-8 rounded-full border-2 transition-all inline-block ${
                      isSelected
                        ? 'ring-2 ring-pedie-green ring-offset-2 ring-offset-pedie-bg border-pedie-green'
                        : 'border-pedie-border hover:border-pedie-green/50'
                    } ${hex === '#ffffff' || hex === '#f5e6d3' ? 'border-pedie-border' : ''}`}
                    style={hex ? { backgroundColor: hex } : undefined}
                  >
                    {!hex && (
                      <span className='flex items-center justify-center w-full h-full text-[8px] font-bold text-pedie-text bg-pedie-card rounded-full'>
                        {color.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  {/* Color name label */}
                  <span
                    className={`text-xs ${isSelected ? 'text-pedie-green font-medium' : 'text-pedie-text-muted'}`}
                  >
                    {color}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className='text-sm font-medium text-pedie-text-muted mb-2'>
          Condition
        </h3>
        <div
          className='flex flex-col gap-2'
          role='radiogroup'
          aria-label='Condition'
        >
          {conditions.map(condition => {
            const isSelected = selectedListing.condition === condition
            const Icon = CONDITION_ICONS[condition] || TbCircleCheck
            const colorClass = CONDITION_COLORS[condition] || 'text-pedie-text'

            // Find lowest price for this condition with remaining current attributes
            let conditionPrice = 0
            const conditionMatches = availableListings.filter(
              l => l.condition === condition
            )
            if (conditionMatches.length > 0) {
              const bestMatch = findBestMatch(
                availableListings,
                selectedListing,
                'condition',
                condition
              )
              conditionPrice = bestMatch.sale_price_kes ?? bestMatch.price_kes
            }

            return (
              <button
                key={condition}
                onClick={() => handleSelect('condition', condition)}
                disabled={disabled}
                aria-disabled={disabled}
                aria-pressed={isSelected}
                className={`flex items-center justify-between p-3 rounded-xl border glass transition-colors ${
                  isSelected
                    ? 'border-pedie-green bg-pedie-green/10'
                    : 'border-pedie-border hover:border-pedie-green/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className='flex items-center gap-2 text-sm font-medium'>
                  <Icon
                    className={`w-5 h-5 ${colorClass}`}
                    aria-hidden='true'
                  />
                  <span className='capitalize'>{condition}</span>
                </div>
                {conditionPrice > 0 && (
                  <span className='text-sm font-semibold text-pedie-text'>
                    {formatKes(conditionPrice)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

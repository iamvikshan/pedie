'use client'

import { CategoryWithChildren } from '@app-types/product'
import Link from 'next/link'

interface MegaMenuProps {
  categories: CategoryWithChildren[]
  activeCategory: string | null
  onClose: () => void
}

export function MegaMenu({
  categories,
  activeCategory,
  onClose,
}: MegaMenuProps) {
  if (!activeCategory) return null

  const activeData = categories.find(c => c.slug === activeCategory)
  if (!activeData || !activeData.children || activeData.children.length === 0)
    return null

  return (
    <div
      className='absolute top-full left-0 z-40 w-full glass border-x-0 border-t-0 p-6 shadow-lg animate-in slide-in-from-top-1 fade-in duration-200'
      onMouseLeave={onClose}
    >
      <div className='pedie-container grid grid-cols-2 md:grid-cols-4 gap-6'>
        {activeData.children.map(child => (
          <Link
            key={child.id}
            href={`/collections/${child.slug}`}
            className='group flex flex-col p-4 rounded-xl hover:bg-pedie-surface transition-colors'
            onClick={onClose}
          >
            <span className='font-semibold text-pedie-text group-hover:text-pedie-green transition-colors'>
              {child.name}
            </span>
            {child.description && (
              <span className='text-sm text-pedie-text-muted mt-1 max-w-xs truncate'>
                {child.description}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

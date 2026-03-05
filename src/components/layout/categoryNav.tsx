'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Category, CategoryWithChildren } from '@app-types/product'
import { MegaMenu } from './megaMenu'

export function CategoryNav({
  categories,
  categoryTree,
}: {
  categories: Category[]
  categoryTree: CategoryWithChildren[]
}) {
  const pathname = usePathname()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <div className='relative'>
      <nav
        className='flex items-center gap-6 text-sm font-medium text-pedie-text'
        onMouseLeave={() => setActiveCategory(null)}
      >
        {categories.map(cat => {
          const href = `/collections/${cat.slug}`
          const isActive = pathname === href
          return (
            <Link
              key={cat.id}
              href={href}
              className={`group relative py-2 transition-colors hover:text-pedie-green ${
                isActive ? 'text-pedie-green' : ''
              }`}
              onMouseEnter={() => setActiveCategory(cat.slug)}
            >
              {cat.name}
              <span
                className={`absolute inset-x-0 bottom-0 h-0.5 bg-pedie-green transition-transform duration-200 origin-left ${
                  isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </Link>
          )
        })}
      </nav>

      {/* Mega Menu */}
      <MegaMenu
        categories={categoryTree}
        activeCategory={activeCategory}
        onClose={() => setActiveCategory(null)}
      />
    </div>
  )
}

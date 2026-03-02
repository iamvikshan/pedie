'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const CATEGORIES = [
  { name: 'Smartphones', href: '/collections/smartphones' },
  { name: 'Laptops', href: '/collections/laptops' },
  { name: 'Tablets', href: '/collections/tablets' },
  { name: 'Accessories', href: '/collections/accessories' },
  { name: 'Wearables', href: '/collections/wearables' },
  { name: 'Audio', href: '/collections/audio' },
] as const

export function CategoryNav() {
  const pathname = usePathname()

  return (
    <nav className='flex items-center gap-6 text-sm font-medium text-pedie-text'>
      {CATEGORIES.map(cat => {
        const isActive = pathname === cat.href
        return (
          <Link
            key={cat.href}
            href={cat.href}
            className={`group relative py-2 transition-colors hover:text-pedie-green ${
              isActive ? 'text-pedie-green' : ''
            }`}
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
  )
}

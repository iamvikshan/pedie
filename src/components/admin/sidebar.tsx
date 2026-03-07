'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/listings', label: 'Listings', icon: '🏷️' },
  { href: '/admin/orders', label: 'Orders', icon: '🛒' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/categories', label: 'Categories', icon: '📁' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: '📧' },
  { href: '/admin/sync', label: 'Sync', icon: '🔄' },
  { href: '/admin/prices', label: 'Prices', icon: '💰' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type='button'
        className='mb-4 rounded-lg border border-pedie-border bg-pedie-card p-2 md:hidden'
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label='Toggle admin menu'
        aria-expanded={mobileOpen}
        aria-controls='admin-sidebar'
      >
        <span className='text-xl'>{mobileOpen ? '✕' : '☰'}</span>
      </button>

      {/* Mobile overlay nav */}
      {mobileOpen && (
        <nav
          id='admin-sidebar'
          className='mb-4 rounded-lg border border-pedie-border bg-pedie-card p-2 md:hidden'
        >
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-pedie-green text-white'
                  : 'text-pedie-text hover:bg-pedie-card-hover'
              }`}
            >
              <span aria-hidden='true'>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      )}

      {/* Desktop sidebar */}
      <aside className='hidden md:block md:w-56 md:shrink-0'>
        <nav className='space-y-1'>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-pedie-green text-white'
                  : 'text-pedie-text hover:bg-pedie-card-hover'
              }`}
            >
              <span aria-hidden='true'>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}

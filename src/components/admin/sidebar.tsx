'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { IconType } from 'react-icons'
import {
  TbCategory,
  TbCoins,
  TbLayoutDashboard,
  TbMail,
  TbMenu2,
  TbPackage,
  TbRefresh,
  TbShoppingCart,
  TbStar,
  TbTags,
  TbUsers,
  TbX,
} from 'react-icons/tb'

const navItems: { href: string; label: string; icon: IconType }[] = [
  { href: '/admin', label: 'Dashboard', icon: TbLayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: TbPackage },
  { href: '/admin/listings', label: 'Listings', icon: TbTags },
  { href: '/admin/orders', label: 'Orders', icon: TbShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: TbUsers },
  { href: '/admin/categories', label: 'Categories', icon: TbCategory },
  { href: '/admin/reviews', label: 'Reviews', icon: TbStar },
  { href: '/admin/newsletter', label: 'Newsletter', icon: TbMail },
  { href: '/admin/sync', label: 'Sync', icon: TbRefresh },
  { href: '/admin/prices', label: 'Prices', icon: TbCoins },
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
        {mobileOpen ? (
          <TbX className='size-5' />
        ) : (
          <TbMenu2 className='size-5' />
        )}
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
              <item.icon className='size-5 shrink-0' aria-hidden='true' />
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
              <item.icon className='size-5 shrink-0' aria-hidden='true' />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}

'use client'

import { useAuth } from '@components/auth/authProvider'
import { UserMenu } from '@components/auth/userMenu'
import { ThemeToggle } from '@components/ui/themeToggle'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useCartStore } from '@lib/cart/store'
import Link from 'next/link'
import { useState } from 'react'
import { TbMenu2, TbShoppingCart, TbUser } from 'react-icons/tb'
import { AllItemsPanel } from './allItemsPanel'
import { CategoryNav } from './categoryNav'
import { MobileNav } from './mobileNav'
import { SearchBar } from './searchBar'

export function Header() {
  const itemCount = useCartStore(s => s.getItemCount())
  const { user, loading, profile } = useAuth()
  const [isAllItemsOpen, setIsAllItemsOpen] = useState(false)
  const scrollDirection = useScrollDirection()

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full glass-depth transition-transform duration-300 ${
          scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Row 1: Logo + Search + Icons */}
        <div className='w-full max-w-7xl mx-auto flex h-16 items-center gap-4 px-4 md:px-6'>
          {/* Mobile burger */}
          <MobileNav />

          {/* Logo */}
          <Link
            href='/'
            className='shrink-0 text-2xl font-bold tracking-tight text-pedie-green'
          >
            pedie
          </Link>

          {/* Search — desktop expanded, hidden on mobile */}
          <div className='hidden flex-1 justify-center md:flex'>
            <div className='w-full max-w-lg'>
              <SearchBar />
            </div>
          </div>

          {/* Right icons */}
          <div className='ml-auto flex items-center gap-2'>
            {/* Search — mobile collapsed icon */}
            <div className='md:hidden'>
              <SearchBar />
            </div>

            {/* Cart */}
            <Link
              href='/cart'
              className='relative rounded-lg p-2 text-pedie-text hover:text-pedie-green transition-colors'
              aria-label='Cart'
            >
              <TbShoppingCart className='h-6 w-6' />
              {itemCount > 0 && (
                <span className='absolute -top-1 -right-1 flex min-w-[20px] h-5 px-1 items-center justify-center rounded-full bg-pedie-green text-xs font-bold text-white'>
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <span className='sr-only'>Cart: {itemCount} items</span>
            </Link>

            {/* User section */}
            {loading ? (
              <div className='hidden md:block h-8 w-8 rounded-full bg-pedie-card animate-pulse' />
            ) : user ? (
              <UserMenu
                userName={
                  profile?.full_name || user.user_metadata?.full_name || null
                }
                avatarUrl={
                  profile?.avatar_url || user.user_metadata?.avatar_url || null
                }
                isAdmin={profile?.role === 'admin'}
              />
            ) : (
              <Link
                href='/auth/signin'
                className='flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-pedie-text hover:text-pedie-green transition-colors'
              >
                <TbUser className='h-6 w-6' />
                <span className='sr-only lg:not-sr-only'>Sign In</span>
              </Link>
            )}

            {/* Theme toggle — desktop only */}
            <div className='hidden md:block'>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Row 2: Category Nav + All Items (desktop only) */}
        <div className='hidden border-t border-pedie-glass-border md:block'>
          <div className='w-full max-w-7xl mx-auto flex h-10 items-center justify-between px-4 md:px-6'>
            <CategoryNav />

            <button
              onClick={() => setIsAllItemsOpen(true)}
              className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-pedie-text hover:text-pedie-green hover:bg-pedie-card transition-colors'
              aria-label='All Items'
            >
              <TbMenu2 className='h-5 w-5' />
              <span>All Items</span>
            </button>
          </div>
        </div>
      </header>

      <AllItemsPanel
        isOpen={isAllItemsOpen}
        onClose={() => setIsAllItemsOpen(false)}
      />
    </>
  )
}

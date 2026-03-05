'use client'

import { useAuth } from '@components/auth/authProvider'
import { UserMenu } from '@components/auth/userMenu'
import { ThemeToggle } from '@components/ui/themeToggle'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useCartStore } from '@lib/cart/store'
import Link from 'next/link'
import { useState } from 'react'
import {
  TbArrowsExchange,
  TbFlame,
  TbMenu2,
  TbShoppingCart,
  TbTool,
  TbUser,
} from 'react-icons/tb'
import { CategoryNav } from './categoryNav'
import { MobileNav } from './mobileNav'
import { SearchBar } from './searchBar'
import { SidebarPanel } from './sidebarPanel'

import { Category, CategoryWithChildren } from '@app-types/product'

export function Header({
  categories = [],
  categoryTree = [],
}: {
  categories?: Category[]
  categoryTree?: CategoryWithChildren[]
}) {
  const itemCount = useCartStore(s => s.getItemCount())
  const { user, loading, profile } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
          <MobileNav categories={categories} />

          {/* Logo */}
          <Link
            href='/'
            className='shrink-0 text-2xl font-bold tracking-tight text-pedie-green'
          >
            pedie
          </Link>

          {/* Search — desktop expanded, hidden on mobile */}
          <div className='hidden flex-1 justify-center lg:flex'>
            <div className='w-full max-w-lg'>
              <SearchBar />
            </div>
          </div>

          {/* Mobile search — expanded, centered */}
          <div className='flex-1 lg:hidden'>
            <SearchBar defaultExpanded />
          </div>

          {/* Right icons — icon+text stacked */}
          <div className='ml-auto flex items-center gap-1'>
            {/* Trade In */}
            <Link
              href='/trade-in'
              className='hidden lg:flex flex-col items-center rounded-lg px-2 py-1 text-pedie-text hover:text-pedie-green transition-colors'
              aria-label='Trade In'
            >
              <TbArrowsExchange className='h-5 w-5' />
              <span className='text-[10px] leading-tight'>Trade In</span>
            </Link>

            {/* Repairs */}
            <Link
              href='/repairs'
              className='hidden lg:flex flex-col items-center rounded-lg px-2 py-1 text-pedie-text hover:text-pedie-green transition-colors'
              aria-label='Repairs'
            >
              <TbTool className='h-5 w-5' />
              <span className='text-[10px] leading-tight'>Repairs</span>
            </Link>

            {/* Cart */}
            <Link
              href='/cart'
              className='relative flex flex-col items-center rounded-lg px-2 py-1 text-pedie-text hover:text-pedie-green transition-colors'
              aria-label='Cart'
            >
              <TbShoppingCart className='h-5 w-5' />
              {itemCount > 0 && (
                <span className='absolute -top-1 -right-1 flex min-w-[20px] h-5 px-1 items-center justify-center rounded-full bg-pedie-green text-xs font-bold text-white'>
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <span className='hidden lg:inline text-[10px] leading-tight'>
                Cart
              </span>
              <span className='sr-only'>Cart: {itemCount} items</span>
            </Link>

            {/* User section */}
            {loading ? (
              <div className='hidden lg:block h-8 w-8 rounded-full bg-pedie-card animate-pulse' />
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
                className='flex flex-col items-center rounded-lg px-2 py-1 text-pedie-text hover:text-pedie-green transition-colors'
                aria-label='Sign In'
              >
                <TbUser className='h-5 w-5' />
                <span className='hidden lg:inline text-[10px] leading-tight'>
                  Sign In
                </span>
              </Link>
            )}

            {/* Theme toggle — desktop only */}
            <div className='hidden lg:block'>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Row 2: All Items + Deals + Category Nav (desktop only) */}
        <div className='hidden border-t border-pedie-glass-border lg:block'>
          <div className='w-full max-w-7xl mx-auto flex h-10 items-center gap-2 px-4 md:px-6'>
            {/* All Items — left */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-pedie-text hover:text-pedie-green hover:bg-pedie-card transition-colors'
              aria-label='All Items'
            >
              <TbMenu2 className='h-4 w-4' />
              <span>All Items</span>
            </button>

            {/* Deals */}
            <Link
              href='/deals'
              className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors'
            >
              <TbFlame className='h-4 w-4' />
              Deals
            </Link>

            {/* Category Nav */}
            <CategoryNav categories={categories} categoryTree={categoryTree} />
          </div>
        </div>
      </header>

      <SidebarPanel
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        categories={categories}
        variant='desktop'
      />
    </>
  )
}

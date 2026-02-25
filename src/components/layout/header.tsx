'use client'

import Link from 'next/link'
import { SearchBar } from './search-bar'
import { MobileNav } from './mobile-nav'
import { useCartStore } from '@lib/cart/store'
import { useAuth } from '@components/auth/auth-provider'
import { UserMenu } from '@components/auth/user-menu'

export function Header() {
  const itemCount = useCartStore(s => s.getItemCount())
  const { user, loading, profile } = useAuth()
  return (
    <header className='sticky top-0 z-50 w-full border-b border-pedie-border bg-pedie-dark'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4 md:px-6'>
        <div className='flex items-center gap-4'>
          <MobileNav />
          <Link
            href='/'
            className='flex items-center gap-1 text-xl font-bold tracking-tight'
          >
            <span className='text-pedie-green'>PEDIE</span>
            <span className='text-pedie-text'>TECH</span>
          </Link>
        </div>

        <nav className='hidden md:flex items-center gap-6 text-sm font-medium text-pedie-text'>
          <Link
            href='/collections/smartphones'
            className='hover:text-pedie-green transition-colors'
          >
            Smartphones
          </Link>
          <Link
            href='/collections/laptops'
            className='hover:text-pedie-green transition-colors'
          >
            Laptops
          </Link>
          <Link
            href='/collections/tablets'
            className='hover:text-pedie-green transition-colors'
          >
            Tablets
          </Link>
          <Link
            href='/collections/accessories'
            className='hover:text-pedie-green transition-colors'
          >
            Accessories
          </Link>
          <Link
            href='/collections/wearables'
            className='hover:text-pedie-green transition-colors'
          >
            Wearables
          </Link>
          <Link
            href='/collections/audio'
            className='hover:text-pedie-green transition-colors'
          >
            Audio
          </Link>
        </nav>

        <div className='flex items-center gap-4'>
          <div className='hidden md:block'>
            <SearchBar />
          </div>

          <Link
            href='/cart'
            className='relative p-2 text-pedie-text hover:text-pedie-green transition-colors'
            aria-label='Cart'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='8' cy='21' r='1' />
              <circle cx='19' cy='21' r='1' />
              <path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' />
            </svg>
            {itemCount > 0 && (
              <span className='absolute -top-1 -right-1 flex min-w-[20px] h-5 px-1 items-center justify-center rounded-full bg-pedie-green text-xs font-bold text-white'>
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
            <span className='sr-only'>Cart: {itemCount} items</span>
          </Link>

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
              className='hidden md:flex items-center gap-2 p-2 text-sm font-medium text-pedie-text hover:text-pedie-green transition-colors'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                <circle cx='12' cy='7' r='4' />
              </svg>
              <span className='sr-only lg:not-sr-only'>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

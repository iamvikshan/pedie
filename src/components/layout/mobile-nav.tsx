'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { SearchBar } from './search-bar'
import { useAuth } from '@components/auth/auth-provider'
import { createClient } from '@lib/supabase/client'
import { useRouter } from 'next/navigation'

export function MobileNav() {
  const { user, loading, profile } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setIsOpen(false)
    hamburgerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isOpen) return

    // Lock body scroll
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus the close button when drawer opens
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }

      // Focus trap
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, close])

  return (
    <div className='md:hidden'>
      <button
        ref={hamburgerRef}
        onClick={() => setIsOpen(true)}
        className='p-2 text-pedie-text hover:text-pedie-green transition-colors'
        aria-label='Open menu'
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
          <line x1='4' x2='20' y1='12' y2='12' />
          <line x1='4' x2='20' y1='6' y2='6' />
          <line x1='4' x2='20' y1='18' y2='18' />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm'
            onClick={close}
          />
          <div
            ref={drawerRef}
            role='dialog'
            aria-modal='true'
            aria-label='Navigation menu'
            className='fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-pedie-dark p-6 shadow-xl border-r border-pedie-border flex flex-col gap-6'
          >
            <div className='flex items-center justify-between'>
              <Link
                href='/'
                className='flex items-center gap-1 text-xl font-bold tracking-tight'
                onClick={close}
              >
                <span className='text-pedie-green'>PEDIE</span>
                <span className='text-pedie-text'>TECH</span>
              </Link>
              <button
                ref={closeButtonRef}
                onClick={close}
                className='p-2 text-pedie-text hover:text-pedie-green transition-colors'
                aria-label='Close menu'
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
                  <path d='M18 6 6 18' />
                  <path d='m6 6 12 12' />
                </svg>
              </button>
            </div>

            <div className='mt-4'>
              <SearchBar />
            </div>

            <nav className='flex flex-col gap-4 mt-4 text-lg font-medium text-pedie-text'>
              <Link
                href='/collections/smartphones'
                onClick={close}
                className='hover:text-pedie-green transition-colors'
              >
                Smartphones
              </Link>
              <Link
                href='/collections/laptops'
                onClick={close}
                className='hover:text-pedie-green transition-colors'
              >
                Laptops
              </Link>
              <Link
                href='/collections/tablets'
                onClick={close}
                className='hover:text-pedie-green transition-colors'
              >
                Tablets
              </Link>
              <Link
                href='/collections/accessories'
                onClick={close}
                className='hover:text-pedie-green transition-colors'
              >
                Accessories
              </Link>
              <Link
                href='/collections/wearables'
                onClick={close}
                className='hover:text-pedie-green transition-colors'
              >
                Wearables
              </Link>
              <Link
                href='/collections/audio'
                onClick={close}
                className='hover:text-pedie-green transition-colors'
              >
                Audio
              </Link>
            </nav>

            <div className='mt-auto pt-6 border-t border-pedie-border'>
              {loading ? (
                <div className='h-10 rounded-lg bg-pedie-card animate-pulse' />
              ) : user ? (
                <div className='flex flex-col gap-3'>
                  <p className='text-sm font-medium text-pedie-text truncate'>
                    {profile?.full_name ||
                      user.user_metadata?.full_name ||
                      'User'}
                  </p>
                  <Link
                    href='/account'
                    onClick={close}
                    className='text-base text-pedie-text hover:text-pedie-green transition-colors'
                  >
                    My Account
                  </Link>
                  <Link
                    href='/account/orders'
                    onClick={close}
                    className='text-base text-pedie-text hover:text-pedie-green transition-colors'
                  >
                    My Orders
                  </Link>
                  <Link
                    href='/account/wishlist'
                    onClick={close}
                    className='text-base text-pedie-text hover:text-pedie-green transition-colors'
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={async () => {
                      const supabase = createClient()
                      await supabase.auth.signOut()
                      close()
                      router.push('/')
                      router.refresh()
                    }}
                    className='text-left text-base text-red-400 hover:text-red-300 transition-colors'
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className='flex flex-col gap-3'>
                  <Link
                    href='/auth/signin'
                    onClick={close}
                    className='flex items-center gap-3 text-lg font-medium text-pedie-text hover:text-pedie-green transition-colors'
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
                    Sign In
                  </Link>
                  <Link
                    href='/auth/signup'
                    onClick={close}
                    className='text-base text-pedie-green hover:underline'
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

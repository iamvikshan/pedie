'use client'

import { useAuth } from '@components/auth/authProvider'
import { ThemeToggle } from '@components/ui/themeToggle'
import { createClient } from '@lib/supabase/client'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  TbDeviceLaptop,
  TbDeviceMobile,
  TbDeviceTablet,
  TbDeviceWatch,
  TbHeadphones,
  TbHeart,
  TbLogout,
  TbMenu2,
  TbPackage,
  TbPlug,
  TbUser,
  TbX,
} from 'react-icons/tb'
import { SearchBar } from './searchBar'

const MOBILE_CATEGORIES = [
  {
    name: 'Smartphones',
    href: '/collections/smartphones',
    icon: TbDeviceMobile,
  },
  { name: 'Laptops', href: '/collections/laptops', icon: TbDeviceLaptop },
  { name: 'Tablets', href: '/collections/tablets', icon: TbDeviceTablet },
  { name: 'Accessories', href: '/collections/accessories', icon: TbPlug },
  { name: 'Wearables', href: '/collections/wearables', icon: TbDeviceWatch },
  { name: 'Audio', href: '/collections/audio', icon: TbHeadphones },
] as const

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

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }

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
        <TbMenu2 className='h-6 w-6' />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-50 bg-pedie-bg/60 backdrop-blur-sm'
              onClick={close}
            />

            <motion.div
              ref={drawerRef}
              role='dialog'
              aria-modal='true'
              aria-label='Navigation menu'
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='fixed inset-y-0 left-0 z-50 flex w-3/4 max-w-sm flex-col gap-6 overflow-y-auto border-r border-pedie-glass-border bg-pedie-glass p-6 shadow-xl backdrop-blur-xl'
            >
              {/* Header */}
              <div className='flex items-center justify-between'>
                <Link
                  href='/'
                  className='text-2xl font-bold tracking-tight text-pedie-green'
                  onClick={close}
                >
                  pedie
                </Link>
                <button
                  ref={closeButtonRef}
                  onClick={close}
                  className='rounded-lg p-2 text-pedie-text-muted hover:text-pedie-text hover:bg-pedie-card transition-colors'
                  aria-label='Close menu'
                >
                  <TbX className='h-5 w-5' />
                </button>
              </div>

              {/* Search */}
              <div>
                <SearchBar />
              </div>

              {/* Category Grid */}
              <nav className='grid grid-cols-2 gap-3'>
                {MOBILE_CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  return (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={close}
                      className='flex flex-col items-center gap-2 rounded-lg border border-pedie-glass-border p-3 text-pedie-text transition-colors hover:bg-pedie-card hover:text-pedie-green'
                    >
                      <Icon className='h-6 w-6' />
                      <span className='text-xs font-medium'>{cat.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Account / Auth Section */}
              <div className='mt-auto border-t border-pedie-glass-border pt-6'>
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
                      className='flex items-center gap-3 text-base text-pedie-text hover:text-pedie-green transition-colors'
                    >
                      <TbUser className='h-5 w-5' />
                      My Account
                    </Link>
                    <Link
                      href='/account/orders'
                      onClick={close}
                      className='flex items-center gap-3 text-base text-pedie-text hover:text-pedie-green transition-colors'
                    >
                      <TbPackage className='h-5 w-5' />
                      My Orders
                    </Link>
                    <Link
                      href='/account/wishlist'
                      onClick={close}
                      className='flex items-center gap-3 text-base text-pedie-text hover:text-pedie-green transition-colors'
                    >
                      <TbHeart className='h-5 w-5' />
                      Wishlist
                    </Link>
                    <button
                      onClick={async () => {
                        try {
                          const supabase = createClient()
                          await supabase.auth.signOut()
                          close()
                          router.push('/')
                          router.refresh()
                        } catch (err) {
                          console.error('Sign-out failed:', err)
                        }
                      }}
                      className='flex items-center gap-3 text-left text-base text-pedie-discount hover:opacity-80 transition-colors'
                    >
                      <TbLogout className='h-5 w-5' />
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
                      <TbUser className='h-6 w-6' />
                      Sign In
                    </Link>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <div className='flex items-center justify-between border-t border-pedie-glass-border pt-4'>
                <span className='text-sm text-pedie-text-muted'>Theme</span>
                <ThemeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

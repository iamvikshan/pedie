'use client'

import { useAuth } from '@components/auth/authProvider'
import { ThemeToggle } from '@components/ui/themeToggle'
import { createClient } from '@lib/supabase/client'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  TbFlame,
  TbHeart,
  TbLogout,
  TbMenu2,
  TbPackage,
  TbSparkles,
  TbTool,
  TbTrendingUp,
  TbUser,
  TbX,
} from 'react-icons/tb'
import { SearchBar } from './searchBar'

const CATEGORY_IMAGES: Record<string, string> = {
  smartphones: '/images/categories/smartphones.jpg',
  laptops: '/images/categories/laptops.jpg',
  tablets: '/images/categories/tablets.jpg',
  accessories: '/images/categories/accessories.jpg',
  wearables: '/images/categories/wearables.jpg',
  audio: '/images/categories/audio.jpg',
  gaming: '/images/categories/gaming.jpg',
}

const QUICK_LINKS = [
  { name: 'Deals', href: '/deals' },
  { name: 'Repairs', href: '/repairs' },
  { name: 'New Arrivals', href: '/collections/new-arrivals' },
  { name: 'Best Sellers', href: '/collections/best-sellers' },
] as const

import type { Category } from '@app-types/product'

export function MobileNav({ categories }: { categories: Category[] }) {
  const { user, loading, profile } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
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

      {typeof document !== 'undefined' &&
        createPortal(
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
                    <SearchBar defaultExpanded />
                  </div>

                  {/* Category Grid — card-style with images */}
                  <nav>
                    <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-pedie-text-muted'>
                      Categories
                    </h3>
                    <div className='grid grid-cols-2 gap-3'>
                      {categories.map(cat => {
                        const imgSrc =
                          cat.image_url || CATEGORY_IMAGES[cat.slug] || ''
                        return (
                          <Link
                            key={cat.id}
                            href={`/collections/${cat.slug}`}
                            onClick={close}
                            className='group relative overflow-hidden rounded-lg border border-pedie-glass-border'
                          >
                            <div className='relative h-20 w-full'>
                              {imgSrc ? (
                                <Image
                                  src={imgSrc}
                                  alt={cat.name}
                                  width={160}
                                  height={100}
                                  className='h-20 w-full object-cover transition-transform duration-300 group-hover:scale-105'
                                  onError={e => {
                                    const target = e.currentTarget
                                    target.style.display = 'none'
                                    const fallback =
                                      target.parentElement?.querySelector<HTMLElement>(
                                        '[data-fallback]'
                                      )
                                    if (fallback)
                                      fallback.style.display = 'flex'
                                  }}
                                />
                              ) : null}
                              <div
                                data-fallback
                                className='flex h-20 w-full items-center justify-center bg-pedie-card text-pedie-text-muted text-xs'
                                style={{
                                  display: imgSrc ? 'none' : 'flex',
                                }}
                              >
                                {cat.name}
                              </div>
                            </div>
                            <span className='absolute inset-0 flex items-end bg-gradient-to-t from-pedie-bg/80 to-transparent p-2 text-sm font-medium text-pedie-text'>
                              {cat.name}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </nav>

                  {/* Quick Links */}
                  <div className='flex flex-col gap-2'>
                    <h3 className='text-xs font-semibold uppercase tracking-wider text-pedie-text-muted'>
                      Quick Links
                    </h3>
                    {QUICK_LINKS.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={close}
                        className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-pedie-text transition-colors hover:bg-pedie-card hover:text-pedie-green'
                      >
                        {link.name === 'Deals' && (
                          <TbFlame className='h-4 w-4 text-amber-400' />
                        )}
                        {link.name === 'Repairs' && (
                          <TbTool className='h-4 w-4 text-pedie-text-muted' />
                        )}
                        {link.name === 'New Arrivals' && (
                          <TbSparkles className='h-4 w-4 text-pedie-green' />
                        )}
                        {link.name === 'Best Sellers' && (
                          <TbTrendingUp className='h-4 w-4 text-pedie-accent' />
                        )}
                        {link.name}
                      </Link>
                    ))}
                  </div>

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
                        {signOutError && (
                          <p className='text-xs text-pedie-discount bg-pedie-discount/10 rounded-lg px-3 py-2'>
                            {signOutError}{' '}
                            <button
                              type='button'
                              onClick={() => setSignOutError(null)}
                              className='underline font-medium'
                            >
                              Dismiss
                            </button>
                          </p>
                        )}
                        <button
                          onClick={async () => {
                            setSignOutError(null)
                            try {
                              const supabase = createClient()
                              const { error } = await supabase.auth.signOut()
                              if (error) {
                                console.error('Sign-out failed:', error)
                                setSignOutError(
                                  'Sign-out failed. Please try again. (or clear your cookies manually if the issue persists)'
                                )
                                return
                              }
                              close()
                              router.push('/')
                              router.refresh()
                            } catch (err) {
                              console.error('Sign-out failed:', err)
                              setSignOutError(
                                'Sign-out failed. Please try again. (or clear your cookies manually if the issue persists)'
                              )
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
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}

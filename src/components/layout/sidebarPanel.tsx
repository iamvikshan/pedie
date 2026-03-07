'use client'

import { useAuth } from '@components/auth/authProvider'
import { ThemeToggle } from '@components/ui/themeToggle'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  TbArrowsExchange,
  TbFlame,
  TbSparkles,
  TbTool,
  TbTrendingUp,
  TbUser,
  TbX,
} from 'react-icons/tb'
import type { Category } from '@app-types/product'

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
  {
    name: 'New Arrivals',
    href: '/collections/new-arrivals',
    icon: TbSparkles,
    iconClass: 'text-pedie-green',
  },
  {
    name: 'Best Sellers',
    href: '/collections/best-sellers',
    icon: TbTrendingUp,
    iconClass: 'text-pedie-accent',
  },
  {
    name: 'Trade In',
    href: '/trade-in',
    icon: TbArrowsExchange,
    iconClass: 'text-pedie-info',
  },
  {
    name: 'Repairs',
    href: '/repairs',
    icon: TbTool,
    iconClass: 'text-pedie-warning',
  },
] as const

interface SidebarPanelProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  brands: { name: string; slug: string; logo_url: string | null }[]
  variant: 'mobile' | 'desktop'
}

export function SidebarPanel({
  isOpen,
  onClose,
  categories,
  brands,
  variant,
}: SidebarPanelProps) {
  const { user, loading, profile } = useAuth()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
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
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, handleKeyDown])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 bg-pedie-bg/60 backdrop-blur-sm'
            onClick={onClose}
          />

          <motion.div
            ref={panelRef}
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
                onClick={onClose}
              >
                pedie
              </Link>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className='rounded-lg p-2 text-pedie-text-muted hover:text-pedie-text hover:bg-pedie-card transition-colors'
                aria-label='Close menu'
              >
                <TbX className='h-6 w-6' />
              </button>
            </div>

            {/* Hot Deals Banner */}
            <section data-section='hot-deals'>
              <Link
                href='/deals'
                onClick={onClose}
                className='flex items-center gap-3 rounded-lg bg-pedie-green/10 px-4 py-3 text-sm font-medium text-pedie-green transition-colors hover:bg-pedie-green/20'
              >
                <TbFlame className='h-5 w-5 text-pedie-warning' />
                <div>
                  <span className='font-semibold'>Hot Deals</span>
                  <span className='ml-2 text-xs text-pedie-text-muted'>
                    Shop Deals
                  </span>
                </div>
              </Link>
            </section>

            {/* Quick Links — inline row */}
            <section data-section='quick-links'>
              <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-pedie-text-muted'>
                Quick Links
              </h3>
              <div className='grid grid-cols-2 gap-2'>
                {QUICK_LINKS.map(link => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className='flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-pedie-text transition-colors hover:bg-pedie-card hover:text-pedie-green'
                    >
                      <Icon className={`h-4 w-4 ${link.iconClass}`} />
                      {link.name}
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* Top Brands */}
            <section data-section='top-brands'>
              <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-pedie-text-muted'>
                Top Brands
              </h3>
              <div className='grid grid-cols-3 gap-3'>
                {brands.map(brand => (
                  <Link
                    key={brand.slug}
                    href={`/collections/brands/${brand.slug}`}
                    onClick={onClose}
                    className='group relative flex items-center justify-center rounded-2xl border border-pedie-border bg-pedie-card p-4 h-16 transition-all duration-200 hover:bg-pedie-card-hover hover:border-pedie-green/30 hover:scale-[1.02]'
                  >
                    {brand.logo_url ? (
                      <Image
                        src={brand.logo_url}
                        alt={brand.name}
                        width={80}
                        height={32}
                        className='object-contain max-h-8 w-auto opacity-70 transition-opacity group-hover:opacity-100'
                        onError={e => {
                          const target = e.currentTarget
                          target.style.display = 'none'
                          if (target.nextElementSibling)
                            (
                              target.nextElementSibling as HTMLElement
                            ).style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <span
                      className='hidden h-full w-full items-center justify-center text-sm font-bold text-pedie-text-muted'
                      style={{ display: brand.logo_url ? 'none' : 'flex' }}
                    >
                      {brand.name.charAt(0)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Category Grid */}
            <section data-section='categories'>
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
                      onClick={onClose}
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
                              if (fallback) fallback.style.display = 'flex'
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
              <Link
                href='/shop'
                onClick={onClose}
                className='mt-3 flex w-fit mx-auto items-center justify-center rounded-full border border-pedie-glass-border bg-pedie-green/10 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-pedie-green transition-colors hover:bg-pedie-green/20'
              >
                All Products
              </Link>
            </section>

            {/* Mobile-only: Account + Theme */}
            {variant === 'mobile' && (
              <div className='mt-auto border-t border-pedie-glass-border pt-6'>
                <div className='flex items-center justify-between'>
                  {loading ? (
                    <div className='h-8 w-8 rounded-full bg-pedie-card animate-pulse' />
                  ) : user ? (
                    <Link
                      href='/account'
                      onClick={onClose}
                      className='flex items-center gap-2 text-sm text-pedie-text hover:text-pedie-green transition-colors'
                    >
                      <TbUser className='h-5 w-5' />
                      {profile?.full_name ||
                        user.user_metadata?.full_name ||
                        'Account'}
                    </Link>
                  ) : (
                    <Link
                      href='/auth/signin'
                      onClick={onClose}
                      className='flex items-center gap-2 text-sm text-pedie-text hover:text-pedie-green transition-colors'
                    >
                      <TbUser className='h-5 w-5' />
                      Sign In
                    </Link>
                  )}
                  <ThemeToggle />
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

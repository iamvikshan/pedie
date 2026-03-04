'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef } from 'react'
import { TbFlame, TbX } from 'react-icons/tb'
import brands from '@data/brands.json'
import { CATEGORIES } from './categoryNav'

const FEATURED_COLLECTIONS = [
  { name: 'Best Sellers', href: '/collections/best-sellers' },
  { name: 'New Arrivals', href: '/collections/new-arrivals' },
  { name: 'Staff Picks', href: '/collections/staff-picks' },
] as const

const HELP_LINKS = [
  { name: 'Contact', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Shipping', href: '/shipping' },
  { name: 'Returns', href: '/returns' },
] as const

const CATEGORY_IMAGES: Record<string, string> = {
  smartphones: '/images/categories/smartphones.jpg',
  laptops: '/images/categories/laptops.jpg',
  tablets: '/images/categories/tablets.jpg',
  accessories: '/images/categories/accessories.jpg',
  wearables: '/images/categories/wearables.jpg',
  audio: '/images/categories/audio.jpg',
}

interface AllItemsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AllItemsPanel({ isOpen, onClose }: AllItemsPanelProps) {
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

  return (
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
            aria-label='All Items'
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-pedie-glass backdrop-blur-xl border-l border-pedie-glass-border shadow-2xl'
          >
            <div className='flex items-center justify-between border-b border-pedie-glass-border p-4'>
              <h2 className='text-lg font-bold text-pedie-text'>All Items</h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className='rounded-lg p-2 text-pedie-text-muted hover:text-pedie-text hover:bg-pedie-card transition-colors'
                aria-label='Close panel'
              >
                <TbX className='h-5 w-5' />
              </button>
            </div>

            <div className='flex flex-col gap-6 p-4'>
              {/* Categories */}
              <section>
                <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-pedie-text-muted'>
                  Categories
                </h3>
                <div className='grid grid-cols-2 gap-3'>
                  {CATEGORIES.map(cat => {
                    const slug = cat.href.split('/').pop() ?? ''
                    return (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        onClick={onClose}
                        className='group relative overflow-hidden rounded-lg border border-pedie-glass-border'
                      >
                        <div className='relative h-20 w-full'>
                          {CATEGORY_IMAGES[slug] ? (
                            <Image
                              src={CATEGORY_IMAGES[slug]}
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
                              display: CATEGORY_IMAGES[slug] ? 'none' : 'flex',
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
              </section>

              {/* Featured Collections */}
              <section>
                <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-pedie-text-muted'>
                  Featured Collections
                </h3>
                <div className='flex flex-col gap-2'>
                  {FEATURED_COLLECTIONS.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className='rounded-lg px-3 py-2 text-sm text-pedie-text transition-colors hover:bg-pedie-card hover:text-pedie-green'
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </section>

              {/* Hot Deals */}
              <section>
                <Link
                  href='/deals'
                  onClick={onClose}
                  className='flex items-center gap-2 rounded-lg bg-pedie-green/10 px-3 py-2.5 text-sm font-medium text-pedie-green transition-colors hover:bg-pedie-green/20'
                >
                  <TbFlame className='h-5 w-5 text-amber-400' />
                  Hot Deals
                </Link>
              </section>

              {/* Popular Brands */}
              <section>
                <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-pedie-text-muted'>
                  Popular Brands
                </h3>
                <div className='grid grid-cols-3 gap-3'>
                  {brands.map(brand => (
                    <Link
                      key={brand.slug}
                      href={`/collections/brands/${brand.slug}`}
                      onClick={onClose}
                      className='group relative flex items-center justify-center rounded-2xl border border-pedie-border bg-pedie-card p-4 h-16 transition-all duration-200 hover:bg-pedie-card-hover hover:border-pedie-green/30 hover:scale-[1.02]'
                    >
                      <Image
                        src={brand.logo}
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
                      <span
                        className='hidden h-full w-full items-center justify-center text-sm font-bold text-pedie-text-muted'
                        style={{ display: 'none' }}
                      >
                        {brand.name.charAt(0)}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Help & Support */}
              <section>
                <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-pedie-text-muted'>
                  Help & Support
                </h3>
                <div className='flex flex-col gap-2'>
                  {HELP_LINKS.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className='rounded-lg px-3 py-2 text-sm text-pedie-text-muted transition-colors hover:bg-pedie-card hover:text-pedie-text'
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { SearchBar } from './search-bar'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (!isOpen) return

    // Focus the close button when drawer opens
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  return (
    <div className='md:hidden'>
      <button
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
            onClick={() => setIsOpen(false)}
          />
          <div className='fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-pedie-dark p-6 shadow-xl border-r border-pedie-border flex flex-col gap-6'>
            <div className='flex items-center justify-between'>
              <Link
                href='/'
                className='flex items-center gap-1 text-xl font-bold tracking-tight'
                onClick={() => setIsOpen(false)}
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
                onClick={() => setIsOpen(false)}
                className='hover:text-pedie-green transition-colors'
              >
                Smartphones
              </Link>
              <Link
                href='/collections/laptops'
                onClick={() => setIsOpen(false)}
                className='hover:text-pedie-green transition-colors'
              >
                Laptops
              </Link>
              <Link
                href='/collections/tablets'
                onClick={() => setIsOpen(false)}
                className='hover:text-pedie-green transition-colors'
              >
                Tablets
              </Link>
              <Link
                href='/collections/accessories'
                onClick={() => setIsOpen(false)}
                className='hover:text-pedie-green transition-colors'
              >
                Accessories
              </Link>
              <Link
                href='/collections/wearables'
                onClick={() => setIsOpen(false)}
                className='hover:text-pedie-green transition-colors'
              >
                Wearables
              </Link>
              <Link
                href='/collections/audio'
                onClick={() => setIsOpen(false)}
                className='hover:text-pedie-green transition-colors'
              >
                Audio
              </Link>
            </nav>

            <div className='mt-auto pt-6 border-t border-pedie-border'>
              <button className='flex items-center gap-3 text-lg font-medium text-pedie-text hover:text-pedie-green transition-colors w-full'>
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
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

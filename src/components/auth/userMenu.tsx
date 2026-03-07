'use client'

import { createClient } from '@lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  TbDashboard,
  TbHeart,
  TbLogout,
  TbPackage,
  TbUser,
} from 'react-icons/tb'

interface UserMenuProps {
  userName: string | null
  avatarUrl: string | null
  isAdmin: boolean
}

export function UserMenu({ userName, avatarUrl, isAdmin }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  function getMenuItems(): HTMLElement[] {
    if (!menuRef.current) return []
    return Array.from(
      menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')
    )
  }

  // Focus first menu item on open
  useEffect(() => {
    if (isOpen) {
      const items = getMenuItems()
      items[0]?.focus()
    }
  }, [isOpen])

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    const items = getMenuItems()
    const currentIndex = items.indexOf(e.target as HTMLElement)

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        items[next]?.focus()
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        items[prev]?.focus()
        break
      }
      case 'Home': {
        e.preventDefault()
        items[0]?.focus()
        break
      }
      case 'End': {
        e.preventDefault()
        items[items.length - 1]?.focus()
        break
      }
      case 'Escape': {
        e.preventDefault()
        setIsOpen(false)
        triggerRef.current?.focus()
        break
      }
      case 'Tab': {
        setIsOpen(false)
        break
      }
    }
  }

  const [signOutError, setSignOutError] = useState(false)

  const handleSignOut = async () => {
    try {
      setSignOutError(false)
      const supabase = createClient()
      await supabase.auth.signOut()
      setIsOpen(false)
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Sign-out failed:', err)
      setSignOutError(true)
    }
  }

  const initials = (() => {
    const trimmed = userName?.trim()
    if (!trimmed) return '?'
    return (
      trimmed
        .split(/\s+/)
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?'
    )
  })()

  return (
    <div className='relative' ref={menuRef}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 p-1.5 rounded-full hover:bg-pedie-card transition-colors'
        aria-label='User menu'
        aria-haspopup='menu'
        aria-expanded={isOpen}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=''
            width={32}
            height={32}
            className='h-8 w-8 rounded-full object-cover'
          />
        ) : (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-pedie-green text-xs font-bold text-white'>
            {initials}
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className='absolute right-0 z-50 mt-2 w-56 rounded-lg glass py-1 shadow-lg'
          role='menu'
          onKeyDown={handleMenuKeyDown}
        >
          <div className='px-4 py-2 border-b border-pedie-border'>
            <p className='text-sm font-medium text-pedie-text truncate'>
              {userName || 'User'}
            </p>
          </div>

          <Link
            href='/account'
            onClick={() => setIsOpen(false)}
            className='flex items-center gap-3 px-4 py-2 text-sm text-pedie-text hover:bg-pedie-card transition-colors'
            role='menuitem'
            tabIndex={-1}
          >
            <TbUser className='h-4 w-4 text-pedie-text-muted' />
            My Account
          </Link>
          <Link
            href='/account/orders'
            onClick={() => setIsOpen(false)}
            className='flex items-center gap-3 px-4 py-2 text-sm text-pedie-text hover:bg-pedie-card transition-colors'
            role='menuitem'
            tabIndex={-1}
          >
            <TbPackage className='h-4 w-4 text-pedie-text-muted' />
            My Orders
          </Link>
          <Link
            href='/account/wishlist'
            onClick={() => setIsOpen(false)}
            className='flex items-center gap-3 px-4 py-2 text-sm text-pedie-text hover:bg-pedie-card transition-colors'
            role='menuitem'
            tabIndex={-1}
          >
            <TbHeart className='h-4 w-4 text-pedie-text-muted' />
            Wishlist
          </Link>

          {isAdmin && (
            <>
              <div className='border-t border-pedie-border my-1' />
              <Link
                href='/admin'
                onClick={() => setIsOpen(false)}
                className='flex items-center gap-3 px-4 py-2 text-sm text-pedie-green font-medium hover:bg-pedie-card transition-colors'
                role='menuitem'
                tabIndex={-1}
              >
                <TbDashboard className='h-4 w-4' />
                Admin Dashboard
              </Link>
            </>
          )}

          <div className='border-t border-pedie-border my-1' />
          {signOutError && (
            <p className='px-4 py-1 text-xs text-pedie-discount'>
              Unable to sign out. Please try again.
            </p>
          )}
          <button
            onClick={handleSignOut}
            className='flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-pedie-discount hover:bg-pedie-card transition-colors'
            role='menuitem'
            tabIndex={-1}
          >
            <TbLogout className='h-4 w-4' />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

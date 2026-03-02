'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@lib/supabase/client'
import {
  TbUser,
  TbPackage,
  TbHeart,
  TbDashboard,
  TbLogout,
} from 'react-icons/tb'

interface UserMenuProps {
  userName: string | null
  avatarUrl: string | null
  isAdmin: boolean
}

export function UserMenu({ userName, avatarUrl, isAdmin }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setIsOpen(false)
      router.push('/')
      router.refresh()
    } catch {
      // Silently handle sign-out failure — user stays on current page
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
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 p-1.5 rounded-full hover:bg-pedie-card transition-colors'
        aria-label='User menu'
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
        <div className='absolute right-0 mt-2 w-56 rounded-lg border border-pedie-glass-border bg-pedie-glass py-1 shadow-lg backdrop-blur-xl z-50'>
          <div className='px-4 py-2 border-b border-pedie-border'>
            <p className='text-sm font-medium text-pedie-text truncate'>
              {userName || 'User'}
            </p>
          </div>

          <Link
            href='/account'
            onClick={() => setIsOpen(false)}
            className='flex items-center gap-3 px-4 py-2 text-sm text-pedie-text hover:bg-pedie-card transition-colors'
          >
            <TbUser className='h-4 w-4 text-pedie-text-muted' />
            My Account
          </Link>
          <Link
            href='/account/orders'
            onClick={() => setIsOpen(false)}
            className='flex items-center gap-3 px-4 py-2 text-sm text-pedie-text hover:bg-pedie-card transition-colors'
          >
            <TbPackage className='h-4 w-4 text-pedie-text-muted' />
            My Orders
          </Link>
          <Link
            href='/account/wishlist'
            onClick={() => setIsOpen(false)}
            className='flex items-center gap-3 px-4 py-2 text-sm text-pedie-text hover:bg-pedie-card transition-colors'
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
              >
                <TbDashboard className='h-4 w-4' />
                Admin Dashboard
              </Link>
            </>
          )}

          <div className='border-t border-pedie-border my-1' />
          <button
            onClick={handleSignOut}
            className='flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-pedie-discount hover:bg-pedie-card transition-colors'
          >
            <TbLogout className='h-4 w-4' />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

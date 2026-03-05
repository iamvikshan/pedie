'use client'

import { useState, useRef, useCallback } from 'react'
import { TbMenu2 } from 'react-icons/tb'
import { SidebarPanel } from './sidebarPanel'

import type { Category } from '@app-types/product'

export function MobileNav({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setIsOpen(false)
    hamburgerRef.current?.focus()
  }, [])

  return (
    <div className='lg:hidden'>
      <button
        ref={hamburgerRef}
        onClick={() => setIsOpen(true)}
        className='p-2 text-pedie-text hover:text-pedie-green transition-colors'
        aria-label='Open menu'
      >
        <TbMenu2 className='h-6 w-6' />
      </button>

      <SidebarPanel
        isOpen={isOpen}
        onClose={close}
        categories={categories}
        variant='mobile'
      />
    </div>
  )
}

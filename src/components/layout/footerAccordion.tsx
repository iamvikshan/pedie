'use client'

import type { ReactNode } from 'react'
import { useState, useSyncExternalStore } from 'react'
import { TbChevronDown } from 'react-icons/tb'

const desktopQuery = '(min-width: 768px)'
const subscribe = (cb: () => void) => {
  const mql = window.matchMedia(desktopQuery)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}
const getSnapshot = () => window.matchMedia(desktopQuery).matches
const getServerSnapshot = () => false

interface FooterAccordionProps {
  title: string
  children: ReactNode
}

export function FooterAccordion({ title, children }: FooterAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isDesktop = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  const expanded = isDesktop || isOpen
  const collapsed = !expanded

  return (
    <div className='footer-accordion' data-open={expanded || undefined}>
      <button
        type='button'
        className='mb-4 flex w-full cursor-pointer items-center justify-between text-lg font-semibold text-pedie-text md:cursor-default'
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={expanded}
      >
        {title}
        <TbChevronDown
          className={`h-4 w-4 transition-transform md:hidden ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden='true'
        />
      </button>
      <ul
        className='flex max-h-0 flex-col gap-3 overflow-hidden text-sm text-pedie-text-muted transition-[max-height] duration-300 md:max-h-[500px]'
        style={expanded ? { maxHeight: '500px' } : undefined}
        aria-hidden={collapsed || undefined}
        inert={collapsed || undefined}
      >
        {children}
      </ul>
    </div>
  )
}

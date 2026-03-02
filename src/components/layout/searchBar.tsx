'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { TbSearch } from 'react-icons/tb'

interface SearchBarProps {
  defaultExpanded?: boolean
}

export function SearchBar({ defaultExpanded = false }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  const handleFormClick = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      // Focus input after expansion
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      inputRef.current?.focus()
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if focus is moving to the submit button (within the same form)
    const relatedTarget = e.relatedTarget as HTMLElement | null
    if (relatedTarget?.closest('form') === e.currentTarget.closest('form')) {
      return
    }
    // Use timeout so a click on submit can fire before collapse
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    blurTimeoutRef.current = setTimeout(() => {
      if (!query) setIsExpanded(false)
    }, 150)
  }

  return (
    <div className='relative flex items-center'>
      <form
        onSubmit={handleSubmit}
        onClick={handleFormClick}
        className={`flex cursor-text items-center overflow-hidden rounded-full glass-search transition-all duration-300 ${
          isExpanded ? 'w-full' : 'w-10 md:w-full md:max-w-lg'
        }`}
      >
        <button
          type='submit'
          className='flex h-10 w-10 shrink-0 items-center justify-center text-pedie-text-muted hover:text-pedie-green transition-colors md:pointer-events-none'
          onClick={e => {
            if (!isExpanded) {
              e.preventDefault()
              setIsExpanded(true)
              requestAnimationFrame(() => inputRef.current?.focus())
            }
          }}
          aria-label='Search'
        >
          <TbSearch className='h-[18px] w-[18px]' />
        </button>
        <input
          ref={inputRef}
          type='search'
          placeholder='Search for devices...'
          aria-label='Search devices'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onBlur={handleBlur}
          className={`h-10 w-full bg-transparent px-2 text-sm text-pedie-text placeholder:text-pedie-text-muted focus:outline-none ${
            isExpanded ? 'opacity-100' : 'sr-only md:not-sr-only md:opacity-100'
          }`}
          tabIndex={0}
        />
      </form>
    </div>
  )
}

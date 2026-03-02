'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TbSearch } from 'react-icons/tb'

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <div className='relative flex items-center'>
      <form
        onSubmit={handleSubmit}
        className={`flex items-center overflow-hidden rounded-full border border-pedie-glass-border bg-pedie-glass backdrop-blur-sm transition-all duration-300 ${
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
            }
          }}
          aria-label='Search'
        >
          <TbSearch className='h-[18px] w-[18px]' />
        </button>
        <input
          type='search'
          placeholder='Search for devices...'
          aria-label='Search devices'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onBlur={() => {
            if (!query) setIsExpanded(false)
          }}
          className={`h-10 w-full bg-transparent px-2 text-sm text-pedie-text placeholder:text-pedie-text-muted focus:outline-none ${
            isExpanded ? 'opacity-100' : 'sr-only md:not-sr-only md:opacity-100'
          }`}
          tabIndex={0}
        />
      </form>
    </div>
  )
}

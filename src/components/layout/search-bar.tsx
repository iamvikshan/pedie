'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
        className={`flex items-center overflow-hidden rounded-full border border-pedie-border bg-pedie-card transition-all duration-300 ${isExpanded ? 'w-full md:w-64' : 'w-10 md:w-64'}`}
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
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle cx='11' cy='11' r='8' />
            <path d='m21 21-4.3-4.3' />
          </svg>
        </button>
        <input
          type='search'
          placeholder='Search for devices...'
          value={query}
          onChange={e => setQuery(e.target.value)}
          className={`h-10 w-full bg-transparent px-2 text-sm text-pedie-text placeholder:text-pedie-text-muted focus:outline-none ${isExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
          tabIndex={0}
        />
      </form>
    </div>
  )
}

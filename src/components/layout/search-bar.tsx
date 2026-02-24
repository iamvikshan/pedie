'use client'

import { useState } from 'react'

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className='relative flex items-center'>
      <div
        className={`flex items-center overflow-hidden rounded-full border border-pedie-border bg-pedie-card transition-all duration-300 ${isExpanded ? 'w-full md:w-64' : 'w-10 md:w-64'}`}
      >
        <button
          type='button'
          className='flex h-10 w-10 shrink-0 items-center justify-center text-pedie-text-muted hover:text-pedie-green transition-colors md:pointer-events-none'
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label='Search'
          aria-expanded={isExpanded}
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
          className={`h-10 w-full bg-transparent px-2 text-sm text-pedie-text placeholder:text-pedie-text-muted focus:outline-none ${isExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
          tabIndex={isExpanded ? 0 : -1}
        />
      </div>
    </div>
  )
}

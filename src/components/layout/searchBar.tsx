'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TbSearch } from 'react-icons/tb'
import { useDebouncedCallback } from 'use-debounce'

interface SearchBarProps {
  defaultExpanded?: boolean
}

interface Suggestion {
  brandName?: string
  name: string
  slug: string
  category?: string
  minPrice?: number
}

export function SearchBar({ defaultExpanded = false }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useDebouncedCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    try {
      const res = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(q)}`
      )
      if (res.ok) {
        const data: Suggestion[] = await res.json()
        setSuggestions(data)
        setShowDropdown(data.length > 0)
        setActiveIndex(-1)
      } else {
        setSuggestions([])
        setShowDropdown(false)
      }
    } catch {
      setSuggestions([])
      setShowDropdown(false)
    }
  }, 300)

  const navigateToSearch = useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim()
      if (trimmed) {
        setShowDropdown(false)
        setSuggestions([])
        router.push(`/search?q=${encodeURIComponent(trimmed)}`)
      }
    },
    [router]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigateToSearch(query)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    fetchSuggestions(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          const s = suggestions[activeIndex]
          navigateToSearch([s.brandName, s.name].filter(Boolean).join(' '))
        } else {
          navigateToSearch(query)
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setActiveIndex(-1)
        break
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.children[activeIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const handleFormClick = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      inputRef.current?.focus()
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null
    if (relatedTarget?.closest('form') === e.currentTarget.closest('form')) {
      return
    }
    // Also keep open if clicking a dropdown item
    if (relatedTarget?.closest('[data-suggestions]')) {
      return
    }
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    blurTimeoutRef.current = setTimeout(() => {
      if (!query) setIsExpanded(false)
      setShowDropdown(false)
    }, 200)
  }

  return (
    <div className='relative flex items-center'>
      <form
        onSubmit={handleSubmit}
        onClick={handleFormClick}
        className={`flex cursor-text items-center overflow-hidden rounded-full glass-search transition-all duration-300 ${
          isExpanded ? 'w-full' : 'w-10 lg:w-full lg:max-w-lg'
        }`}
      >
        <button
          type='submit'
          className='flex h-10 w-10 shrink-0 items-center justify-center text-pedie-text-muted hover:text-pedie-green transition-colors lg:pointer-events-none'
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
          aria-autocomplete='list'
          aria-controls='search-suggestions'
          role='combobox'
          aria-expanded={showDropdown}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`h-10 w-full bg-transparent px-2 text-sm text-pedie-text placeholder:text-pedie-text-muted focus:outline-none ${
            isExpanded ? 'opacity-100' : 'sr-only lg:not-sr-only lg:opacity-100'
          }`}
          tabIndex={0}
        />
      </form>

      {/* Autocomplete dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul
          ref={dropdownRef}
          id='search-suggestions'
          data-suggestions
          role='listbox'
          className='absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-pedie-border bg-pedie-card shadow-lg'
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.slug}-${i}`}
              role='option'
              aria-selected={i === activeIndex}
              className={`flex cursor-pointer items-center justify-between px-4 py-3 text-sm transition-colors ${
                i === activeIndex
                  ? 'bg-pedie-green/10 text-pedie-green'
                  : 'text-pedie-text hover:bg-pedie-border/50'
              }`}
              onMouseDown={e => {
                e.preventDefault()
                navigateToSearch(
                  [s.brandName, s.name].filter(Boolean).join(' ')
                )
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className='font-medium'>
                {[s.brandName, s.name].filter(Boolean).join(' ')}
              </span>
              {s.category && (
                <span className='text-xs text-pedie-text-muted capitalize'>
                  {s.category}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

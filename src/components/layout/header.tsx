import Link from 'next/link'
import { SearchBar } from './search-bar'
import { MobileNav } from './mobile-nav'

export function Header() {
  return (
    <header className='sticky top-0 z-50 w-full border-b border-pedie-border bg-pedie-dark'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4 md:px-6'>
        <div className='flex items-center gap-4'>
          <MobileNav />
          <Link
            href='/'
            className='flex items-center gap-1 text-xl font-bold tracking-tight'
          >
            <span className='text-pedie-green'>PEDIE</span>
            <span className='text-pedie-text'>TECH</span>
          </Link>
        </div>

        <nav className='hidden md:flex items-center gap-6 text-sm font-medium text-pedie-text'>
          <Link
            href='/collections/smartphones'
            className='hover:text-pedie-green transition-colors'
          >
            Smartphones
          </Link>
          <Link
            href='/collections/laptops'
            className='hover:text-pedie-green transition-colors'
          >
            Laptops
          </Link>
          <Link
            href='/collections/tablets'
            className='hover:text-pedie-green transition-colors'
          >
            Tablets
          </Link>
          <Link
            href='/collections/accessories'
            className='hover:text-pedie-green transition-colors'
          >
            Accessories
          </Link>
          <Link
            href='/collections/wearables'
            className='hover:text-pedie-green transition-colors'
          >
            Wearables
          </Link>
          <Link
            href='/collections/audio'
            className='hover:text-pedie-green transition-colors'
          >
            Audio
          </Link>
        </nav>

        <div className='flex items-center gap-4'>
          <div className='hidden md:block'>
            <SearchBar />
          </div>

          <button
            className='relative p-2 text-pedie-text hover:text-pedie-green transition-colors'
            aria-label='Cart'
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
              <circle cx='8' cy='21' r='1' />
              <circle cx='19' cy='21' r='1' />
              <path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' />
            </svg>
            <span className='sr-only'>Cart: 0 items</span>
          </button>

          <button
            className='hidden md:flex items-center gap-2 p-2 text-sm font-medium text-pedie-text hover:text-pedie-green transition-colors'
            aria-label='Sign In'
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
              <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
              <circle cx='12' cy='7' r='4' />
            </svg>
            <span className='sr-only lg:not-sr-only'>Sign In</span>
          </button>
        </div>
      </div>
    </header>
  )
}

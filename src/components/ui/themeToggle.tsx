'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { TbSun, TbMoonFilled } from 'react-icons/tb'

const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!mounted) {
    return <div className='h-9 w-9' /> // Placeholder to prevent layout shift
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='flex h-9 w-9 items-center justify-center rounded-xl text-pedie-text-muted hover:text-pedie-text hover:bg-pedie-card-hover transition-colors'
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <TbSun className='h-5 w-5' />
      ) : (
        <TbMoonFilled className='h-5 w-5' />
      )}
    </button>
  )
}

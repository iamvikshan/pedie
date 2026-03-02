'use client'

import { useEffect, useState } from 'react'

/** Minimum scroll delta (px) before direction changes */
export const SCROLL_THRESHOLD = 10

export type ScrollDirection = 'up' | 'down'

/**
 * Tracks vertical scroll direction with a threshold to avoid jitter.
 * SSR-safe — the listener is only attached inside useEffect.
 */
export function useScrollDirection(): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>('up')

  useEffect(() => {
    let lastY = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastY

      if (Math.abs(delta) >= SCROLL_THRESHOLD) {
        setDirection(delta > 0 ? 'down' : 'up')
        lastY = currentY
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return direction
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

export const SLIDES = [
  {
    title: 'Quality Refurbished Electronics for Kenya',
    subtitle: 'Save up to 40% on premium smartphones, laptops, and more',
    cta: 'Shop Now',
    link: '/collections/smartphones',
  },
  {
    title: 'Save Up to 40% on Premium Devices',
    subtitle: 'Every device tested, graded & certified',
    cta: 'View Deals',
    link: '/deals',
  },
  {
    title: '3-Month Warranty on Every Device',
    subtitle: 'Quality tested, satisfaction guaranteed',
    cta: 'Learn More',
    link: '/about',
  },
]

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isManuallyPaused, setIsManuallyPaused] = useState(false)
  const [isInteractionPaused, setIsInteractionPaused] = useState(false)

  const isPaused = isManuallyPaused || isInteractionPaused

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  const handleFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    if (
      !e.relatedTarget ||
      !e.currentTarget.contains(e.relatedTarget as Node)
    ) {
      setIsInteractionPaused(true)
    }
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    if (
      !e.relatedTarget ||
      !e.currentTarget.contains(e.relatedTarget as Node)
    ) {
      setIsInteractionPaused(false)
    }
  }, [])

  return (
    <div
      className='relative h-[400px] md:h-[500px] w-full overflow-hidden bg-pedie-dark'
      onMouseEnter={() => setIsInteractionPaused(true)}
      onMouseLeave={() => setIsInteractionPaused(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          aria-hidden={index !== currentSlide}
        >
          <div className='absolute inset-0 bg-gradient-to-b from-pedie-dark/80 to-pedie-dark/40 z-0' />
          <div className='relative z-10 max-w-3xl'>
            <h2 className='text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight'>
              {slide.title}
            </h2>
            <p className='text-lg md:text-xl text-pedie-text-muted mb-8'>
              {slide.subtitle}
            </p>
            <Link
              href={slide.link}
              className='inline-flex items-center justify-center rounded-md bg-pedie-green px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-pedie-green/90'
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      ))}

      <div className='absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-3'>
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type='button'
            onClick={() => setCurrentSlide(index)}
            className={`h-3 w-3 rounded-full transition-colors ${index === currentSlide ? 'bg-pedie-green' : 'bg-white/30 hover:bg-white/50'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
        <button
          type='button'
          onClick={() => setIsManuallyPaused(p => !p)}
          className='ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors'
          aria-label={isManuallyPaused ? 'Resume slideshow' : 'Pause slideshow'}
        >
          {isManuallyPaused ? (
            <svg className='h-3 w-3' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M8 5v14l11-7z' />
            </svg>
          ) : (
            <svg className='h-3 w-3' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M6 4h4v16H6V4zm8 0h4v16h-4V4z' />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

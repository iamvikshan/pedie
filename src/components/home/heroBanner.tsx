'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  TbChevronLeft,
  TbChevronRight,
  TbPlayerPause,
  TbPlayerPlay,
} from 'react-icons/tb'
import heroSlides from '@/data/hero.json'

export { heroSlides as SLIDES }

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isManuallyPaused, setIsManuallyPaused] = useState(false)
  const [isInteractionPaused, setIsInteractionPaused] = useState(false)
  const [imgError, setImgError] = useState<Record<number, boolean>>({})
  const [lastInteraction, setLastInteraction] = useState(0)
  const [showChevrons, setShowChevrons] = useState(false)

  const isPaused = isManuallyPaused || isInteractionPaused
  const hasSlides = heroSlides && heroSlides.length > 0
  const safeIndex = hasSlides ? currentSlide % heroSlides.length : 0
  const slide = hasSlides ? heroSlides[safeIndex] : null

  useEffect(() => {
    if (isPaused || !hasSlides) return
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, hasSlides])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowChevrons(Date.now() - lastInteraction < 3000)
    }, 300)
    return () => clearInterval(interval)
  }, [lastInteraction])

  const handleMouseMove = useCallback(() => {
    setLastInteraction(Date.now())
  }, [])

  const handleChevronClick = useCallback((direction: 'prev' | 'next') => {
    setLastInteraction(Date.now())
    setCurrentSlide(prev =>
      direction === 'prev'
        ? (prev - 1 + heroSlides.length) % heroSlides.length
        : (prev + 1) % heroSlides.length
    )
  }, [])

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

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  }

  // Defensive guard for empty or malformed slide data
  if (!slide) {
    return (
      <div className='relative flex h-[220px] md:h-[280px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pedie-green/20 to-pedie-bg'>
        <p className='text-pedie-text-muted'>No slides available</p>
      </div>
    )
  }

  return (
    <div
      className='relative h-[220px] md:h-[280px] w-full overflow-hidden rounded-2xl'
      onMouseEnter={() => setIsInteractionPaused(true)}
      onMouseLeave={() => setIsInteractionPaused(false)}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <AnimatePresence mode='wait'>
        <motion.div
          key={safeIndex}
          variants={slideVariants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className='absolute inset-0'
        >
          {/* Background image or gradient fallback */}
          {!imgError[safeIndex] ? (
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className='object-cover'
              priority={safeIndex === 0}
              onError={() =>
                setImgError(prev => ({ ...prev, [safeIndex]: true }))
              }
            />
          ) : (
            <div className='absolute inset-0 bg-gradient-to-br from-pedie-green/30 to-pedie-bg' />
          )}

          {/* Gradient overlay for text readability */}
          <div className='absolute inset-0 bg-gradient-to-r from-pedie-bg/80 to-transparent z-[1]' />

          {/* Content */}
          <div className='relative z-10 flex h-full flex-col justify-center px-6 md:px-12 max-w-2xl'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className='text-xl md:text-3xl lg:text-4xl font-bold text-pedie-text leading-tight mb-2 md:mb-3'
            >
              {slide.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className='text-sm md:text-base text-pedie-text-muted mb-3 md:mb-4'
            >
              {slide.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Link
                href={slide.link}
                className='inline-flex items-center justify-center rounded-xl bg-pedie-green px-6 py-2.5 text-sm md:text-base font-medium text-white transition-colors hover:bg-pedie-green-dark'
              >
                {slide.cta}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Chevron navigation — desktop only, auto-hide */}
      <button
        type='button'
        onClick={() => handleChevronClick('prev')}
        className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-pedie-bg/50 hover:bg-pedie-bg/70 backdrop-blur-sm text-pedie-text transition-all duration-300 ${showChevrons ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label='Previous slide'
        tabIndex={showChevrons ? 0 : -1}
        aria-hidden={!showChevrons}
      >
        <TbChevronLeft className='h-5 w-5' />
      </button>
      <button
        type='button'
        onClick={() => handleChevronClick('next')}
        className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-pedie-bg/50 hover:bg-pedie-bg/70 backdrop-blur-sm text-pedie-text transition-all duration-300 ${showChevrons ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label='Next slide'
        tabIndex={showChevrons ? 0 : -1}
        aria-hidden={!showChevrons}
      >
        <TbChevronRight className='h-5 w-5' />
      </button>

      {/* Progress dots & pause/play */}
      <div className='absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2'>
        {heroSlides.map((_, index) => (
          <button
            key={index}
            type='button'
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === safeIndex
                ? 'bg-pedie-green'
                : 'bg-pedie-text-muted/30 hover:bg-pedie-text-muted/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
        <button
          type='button'
          onClick={() => setIsManuallyPaused(p => !p)}
          className='ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-pedie-bg/30 text-pedie-text hover:bg-pedie-bg/50 transition-colors backdrop-blur-sm'
          aria-label={isManuallyPaused ? 'Resume slideshow' : 'Pause slideshow'}
        >
          {isManuallyPaused ? (
            <TbPlayerPlay className='h-3 w-3' />
          ) : (
            <TbPlayerPause className='h-3 w-3' />
          )}
        </button>
      </div>
    </div>
  )
}

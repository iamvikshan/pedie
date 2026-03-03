'use client'

import type { ListingWithProduct } from '@app-types/product'
import { ProductCard } from '@components/ui/productCard'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TbFlame } from 'react-icons/tb'
import { URGENCY_TEXT } from '@/config'

interface HotDealsProps {
  listings: ListingWithProduct[]
}

export function HotDeals({ listings }: HotDealsProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()

      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isHovered || !scrollRef.current) return
    const el = scrollRef.current
    const interval = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: 300, behavior: 'smooth' })
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [isHovered])

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  if (listings.length === 0) return null

  return (
    <section className='py-16 bg-gradient-to-r from-pedie-card/50 via-amber-950/10 to-pedie-card/50 border-y border-pedie-border'>
      <div className='w-full max-w-7xl mx-auto px-4 md:px-6'>
        <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
          {/* Timer Card — left column */}
          <div className='md:col-span-3'>
            <div className='relative rounded-2xl bg-gradient-to-br from-amber-400/30 via-red-500/20 to-amber-400/30 p-[2px] shadow-[0_0_30px_rgba(251,191,36,0.15)] h-full'>
              <div className='bg-pedie-dark rounded-2xl p-6 flex flex-col items-center justify-center h-full gap-4'>
                <TbFlame
                  className='w-10 h-10 text-amber-400'
                  aria-hidden='true'
                />
                <h2 className='text-2xl font-bold text-white'>Hot Deals</h2>

                <div className='flex items-center gap-2'>
                  <div className='bg-pedie-dark/80 border border-amber-400/30 rounded-lg px-3 py-2 text-center'>
                    <span className='text-2xl font-mono font-bold text-amber-400'>
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className='text-amber-400 font-bold text-xl'>:</span>
                  <div className='bg-pedie-dark/80 border border-amber-400/30 rounded-lg px-3 py-2 text-center'>
                    <span className='text-2xl font-mono font-bold text-amber-400'>
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className='text-amber-400 font-bold text-xl'>:</span>
                  <div className='bg-pedie-dark/80 border border-amber-400/30 rounded-lg px-3 py-2 text-center'>
                    <span className='text-2xl font-mono font-bold text-amber-400'>
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <p className='text-xs text-red-400 font-medium text-center'>
                  {URGENCY_TEXT}
                </p>

                <Link
                  href='/deals'
                  className='bg-amber-400 text-pedie-dark font-bold rounded-xl px-6 py-2.5 transition-colors hover:bg-amber-300 text-sm'
                >
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* Product Swiper — right column */}
          <div className='md:col-span-9'>
            <div
              ref={scrollRef}
              className='flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-4 pb-4'
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocusCapture={handleMouseEnter}
              onBlurCapture={handleMouseLeave}
            >
              {listings.map(listing => (
                <div
                  key={listing.id}
                  className='min-w-[280px] max-w-[300px] snap-start flex-shrink-0'
                >
                  <ProductCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import type { ListingWithProduct } from '@app-types/product'
import { ProductCard } from '@components/ui/productCard'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TbFlame } from 'react-icons/tb'

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
    <section className='py-16'>
      <div className='w-full pedie-container'>
        <div className='flex items-center justify-between mb-8'>
          <h2 className='text-xl font-bold text-pedie-text'>Hot Deals</h2>
          <Link
            href='/deals'
            className='text-sm font-medium text-pedie-green hover:underline'
          >
            See all →
          </Link>
        </div>

        <div className='rounded-lg overflow-hidden border border-pedie-border bg-pedie-card'>
          <div className='grid grid-cols-1 md:grid-cols-6'>
            <div className='md:col-span-1 bg-pedie-sunken p-6 flex flex-col items-center justify-center border-r border-pedie-border gap-4 h-full'>
              <TbFlame
                className='w-10 h-10 text-pedie-warning'
                aria-hidden='true'
              />
              <h3 className='text-xl font-bold text-white text-center leading-tight'>
                Today Deals
              </h3>

              <div className='flex items-center gap-1.5'>
                <div className='bg-black/40 border border-pedie-warning/20 rounded px-2 py-1.5 text-center min-w-[36px]'>
                  <span className='text-lg font-mono font-bold text-pedie-warning leading-none'>
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </span>
                </div>
                <span className='text-pedie-warning/50 font-bold'>:</span>
                <div className='bg-black/40 border border-pedie-warning/20 rounded px-2 py-1.5 text-center min-w-[36px]'>
                  <span className='text-lg font-mono font-bold text-pedie-warning leading-none'>
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </span>
                </div>
                <span className='text-pedie-warning/50 font-bold'>:</span>
                <div className='bg-black/40 border border-pedie-warning/20 rounded px-2 py-1.5 text-center min-w-[36px]'>
                  <span className='text-lg font-mono font-bold text-pedie-warning leading-none'>
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              <Link
                href='/deals'
                className='bg-pedie-warning text-pedie-dark font-bold rounded-lg px-6 py-2 transition-colors hover:opacity-90 text-sm mt-2 w-full text-center'
              >
                Shop all Deals
              </Link>
            </div>

            <div className='md:col-span-5 p-6 bg-gradient-to-r from-amber-50/50 to-transparent'>
              <div
                ref={scrollRef}
                className='flex overflow-x-auto hide-scrollbar snap-x gap-4 pb-2'
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocusCapture={handleMouseEnter}
                onBlurCapture={handleMouseLeave}
              >
                {listings.map(listing => (
                  <div
                    key={listing.id}
                    className='min-w-[180px] max-w-[200px] flex-shrink-0 snap-start'
                  >
                    <ProductCard listing={listing} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

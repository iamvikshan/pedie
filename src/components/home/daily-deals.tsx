'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@components/ui/product-card'
import type { ListingWithProduct } from '@app-types/product'

interface DailyDealsProps {
  listings: ListingWithProduct[]
}

export function DailyDeals({ listings }: DailyDealsProps) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date()
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    const diff = midnight.getTime() - now.getTime()
    if (diff > 0) {
      return {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      }
    }
    return { hours: 0, minutes: 0, seconds: 0 }
  })

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

  if (listings.length === 0) return null

  return (
    <section className='py-16 bg-pedie-card/50 border-y border-pedie-border'>
      <div className='container mx-auto px-4 md:px-6'>
        <div className='flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4'>
          <div className='flex items-center gap-3'>
            <h2 className='text-2xl md:text-3xl font-bold text-pedie-text'>
              Daily Deals
            </h2>
            <span className='bg-pedie-discount text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider'>
              Hot
            </span>
          </div>

          <div className='flex items-center gap-2 text-pedie-text'>
            <span className='text-sm text-pedie-text-muted mr-2'>Ends in:</span>
            <div className='flex gap-2'>
              <div className='bg-pedie-dark border border-pedie-border rounded px-2 py-1 min-w-[40px] text-center font-mono font-bold'>
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <span className='font-bold'>:</span>
              <div className='bg-pedie-dark border border-pedie-border rounded px-2 py-1 min-w-[40px] text-center font-mono font-bold'>
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <span className='font-bold'>:</span>
              <div className='bg-pedie-dark border border-pedie-border rounded px-2 py-1 min-w-[40px] text-center font-mono font-bold text-pedie-discount'>
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {listings.slice(0, 4).map(deal => (
            <ProductCard key={deal.id} listing={deal} />
          ))}
        </div>
      </div>
    </section>
  )
}

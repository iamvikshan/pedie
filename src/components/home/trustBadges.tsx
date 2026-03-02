'use client'

import { motion } from 'framer-motion'
import {
  TbCircleCheck,
  TbRefresh,
  TbShieldCheck,
  TbStar,
  TbTruck,
} from 'react-icons/tb'

export const BADGE_TITLES = [
  '3-Month Warranty',
  'Free Delivery',
  'Quality Tested',
  '7-Day Returns',
]

const BADGE_ICONS = [TbShieldCheck, TbTruck, TbCircleCheck, TbRefresh]

export function TrustBadges() {
  return (
    <section className='border-b border-pedie-border bg-pedie-surface'>
      <div className='w-full max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-3 md:px-6'>
        {/* Left: trust badges strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className='flex items-center gap-4 overflow-x-auto hide-scrollbar md:gap-6'
        >
          {BADGE_TITLES.map((title, index) => {
            const Icon = BADGE_ICONS[index]
            return (
              <div
                key={title}
                className='flex shrink-0 items-center gap-2 text-pedie-text'
              >
                <Icon
                  className='h-4 w-4 text-pedie-green md:h-5 md:w-5'
                  aria-hidden
                />
                <span className='whitespace-nowrap text-xs font-medium md:text-sm'>
                  {title}
                </span>
              </div>
            )
          })}
        </motion.div>

        {/* Right: Trustpilot-style review badge placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className='hidden shrink-0 items-center gap-2 md:flex'
        >
          <div className='flex items-center gap-1'>
            {Array.from({ length: 5 }).map((_, i) => (
              <TbStar
                key={i}
                className='h-4 w-4 fill-pedie-green text-pedie-green'
              />
            ))}
          </div>
          <span className='whitespace-nowrap text-xs font-medium text-pedie-text-muted'>
            Excellent on Trustpilot
          </span>
        </motion.div>
      </div>
    </section>
  )
}

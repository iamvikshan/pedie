'use client'

import type { Listing } from '@app-types/product'
import { formatKes } from '@helpers'
import Link from 'next/link'
import { TbSparkles } from 'react-icons/tb'
import { motion } from 'framer-motion'

interface BetterDealNudgeProps {
  betterDeal: Listing | null
  savings?: number
}

export default function BetterDealNudge({
  betterDeal,
  savings,
}: BetterDealNudgeProps) {
  if (!betterDeal) return null

  const difference =
    typeof savings === 'number' && savings > 0 ? formatKes(savings) : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className='glass rounded-xl p-3 border border-pedie-green/20 flex items-center justify-between gap-3 bg-white/5'
    >
      <div className='flex items-center gap-2'>
        <TbSparkles className='text-pedie-green' size={20} />
        <span className='text-sm text-pedie-green'>
          A better deal is available for this configuration
        </span>
      </div>
      <Link
        href={`/listings/${betterDeal.sku}`}
        className='text-sm font-medium text-pedie-green hover:underline'
      >
        {difference ? `Save ${difference}` : 'View better deal'} &rarr;
      </Link>
    </motion.div>
  )
}

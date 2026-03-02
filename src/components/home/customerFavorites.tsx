'use client'

import type { ListingWithProduct } from '@app-types/product'
import { ProductCard } from '@components/ui/productCard'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

export const TABS = [
  { id: 'all', label: 'All' },
  { id: 'smartphones', label: 'Smartphones' },
  { id: 'laptops', label: 'Laptops' },
  { id: 'tablets', label: 'Tablets' },
] as const

interface CustomerFavoritesProps {
  listings: ListingWithProduct[]
}

export function CustomerFavorites({ listings }: CustomerFavoritesProps) {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = useMemo(() => {
    if (activeTab === 'all') return listings
    return listings.filter(l => l.product?.category?.slug === activeTab)
  }, [activeTab, listings])

  return (
    <motion.section
      className='py-16 container mx-auto px-4 md:px-6'
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4'>
        <h2 className='text-2xl md:text-3xl font-bold text-pedie-text'>
          Customer Favorites
        </h2>

        <div
          className='flex overflow-x-auto pb-2 md:pb-0 gap-2 hide-scrollbar'
          role='tablist'
          aria-label='Filter by category'
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              role='tab'
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'glass text-pedie-text-muted hover:text-pedie-text'
              }`}
            >
              {activeTab === tab.id && (
                <motion.span
                  layoutId='activeTab'
                  className='absolute inset-0 bg-pedie-green rounded-full'
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className='relative z-10'>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <motion.div
          className='flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x'
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {filtered.map(listing => (
            <motion.div
              key={listing.id}
              className='min-w-[280px] max-w-[300px] snap-start'
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ProductCard listing={listing} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className='text-center py-12 bg-pedie-card rounded-xl border border-pedie-border'>
          <p className='text-pedie-text-muted'>
            No products found for this category.
          </p>
        </div>
      )}
    </motion.section>
  )
}

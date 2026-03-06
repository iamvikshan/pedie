'use client'

import type { ProductFamily } from '@app-types/product'
import { ProductFamilyCard } from '@components/ui/productFamilyCard'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'

interface CustomerFavoritesProps {
  families: ProductFamily[]
}

export function CustomerFavorites({ families }: CustomerFavoritesProps) {
  const [activeTab, setActiveTab] = useState('all')
  const scrollRef = useRef<HTMLDivElement>(null)

  const tabs = useMemo(() => {
    const defaultTabs = [{ id: 'all', label: 'All' }]
    const categoryMap = new Map<string, string>()

    families.forEach(f => {
      if (f.product?.category?.slug && f.product?.category?.name) {
        if (!categoryMap.has(f.product.category.slug)) {
          categoryMap.set(f.product.category.slug, f.product.category.name)
        }
      }
    })

    const dynamicTabs = Array.from(categoryMap.entries()).map(
      ([slug, name]) => ({
        id: slug,
        label: name,
      })
    )

    return [...defaultTabs, ...dynamicTabs]
  }, [families])

  const handleTabChange = (id: string) => {
    setActiveTab(id)
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }

  const filtered = families.filter(
    f =>
      f.product &&
      (activeTab === 'all' || f.product.category?.slug === activeTab)
  )

  return (
    <motion.section
      className='py-16 w-full pedie-container'
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex flex-col mb-8 gap-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold text-pedie-text'>
            Customer Favorites
          </h2>
          <Link
            href='/shop'
            className='text-sm font-medium text-pedie-green hover:underline'
          >
            View All →
          </Link>
        </div>
        <div
          className='flex overflow-x-auto pb-2 md:pb-0 gap-2 hide-scrollbar'
          role='tablist'
          aria-label='Filter by category'
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              role='tab'
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'glass text-pedie-text-muted hover:text-pedie-text'
              }`}
            >
              {activeTab === tab.id && (
                <motion.span
                  layoutId='activeTabCustomerFavorites'
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
          key={activeTab}
          ref={scrollRef}
          className='flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x'
          initial='hidden'
          animate='visible'
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {filtered.map(family => (
            <motion.div
              key={family.product.id}
              className='min-w-[180px] max-w-[200px] snap-start flex-shrink-0'
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ProductFamilyCard family={family} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className='text-center text-pedie-text-muted py-8'>
          No items found in this category.
        </p>
      )}
    </motion.section>
  )
}

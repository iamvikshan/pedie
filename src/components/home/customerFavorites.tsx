'use client'

import { useState, useMemo } from 'react'
import { ProductCard } from '@components/ui/productCard'
import type { ListingWithProduct } from '@app-types/product'

interface CustomerFavoritesProps {
  listings: ListingWithProduct[]
}

export function CustomerFavorites({ listings }: CustomerFavoritesProps) {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'smartphones', label: 'Smartphones' },
    { id: 'laptops', label: 'Laptops' },
    { id: 'tablets', label: 'Tablets' },
  ]

  const filtered = useMemo(() => {
    if (activeTab === 'all') return listings
    return listings.filter(l => l.product?.category?.slug === activeTab)
  }, [activeTab, listings])

  return (
    <section className='py-16 container mx-auto px-4 md:px-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4'>
        <h2 className='text-2xl md:text-3xl font-bold text-pedie-text'>
          Customer Favorites
        </h2>

        <div className='flex overflow-x-auto pb-2 md:pb-0 gap-2 hide-scrollbar'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-pedie-green text-white'
                  : 'bg-pedie-card text-pedie-text-muted hover:text-pedie-text border border-pedie-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className='flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x'>
          {filtered.map(listing => (
            <div
              key={listing.id}
              className='min-w-[280px] max-w-[300px] snap-start'
            >
              <ProductCard listing={listing} />
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12 bg-pedie-card rounded-xl border border-pedie-border'>
          <p className='text-pedie-text-muted'>
            No products found for this category.
          </p>
        </div>
      )}
    </section>
  )
}

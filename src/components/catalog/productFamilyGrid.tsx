'use client'

import type { ProductFamily } from '@app-types/product'
import { ProductFamilyCard } from '@components/ui/productFamilyCard'
import { TbSearch } from 'react-icons/tb'

interface ProductFamilyGridProps {
  families: ProductFamily[]
}

export function ProductFamilyGrid({ families }: ProductFamilyGridProps) {
  if (families.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 px-4 text-center bg-pedie-card rounded-xl border border-pedie-border'>
        <TbSearch
          className='w-16 h-16 text-pedie-text-muted mb-4'
          aria-hidden='true'
        />
        <h3 className='text-xl font-semibold text-pedie-text mb-2'>
          No products found
        </h3>
        <p className='text-pedie-text-muted max-w-md'>
          We couldn&apos;t find any products matching your current filters. Try
          adjusting or clearing some filters to see more results.
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      {families.map(family => (
        <ProductFamilyCard key={family.product.id} family={family} />
      ))}
    </div>
  )
}

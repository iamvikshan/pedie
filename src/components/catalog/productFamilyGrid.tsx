'use client'

import type { ProductFamily } from '@app-types/product'
import { EmptyState } from '@components/ui/emptyState'
import { ProductFamilyCard } from '@components/ui/productFamilyCard'
import { TbSearch } from 'react-icons/tb'

interface ProductFamilyGridProps {
  families: ProductFamily[]
}

export function ProductFamilyGrid({ families }: ProductFamilyGridProps) {
  if (families.length === 0) {
    return (
      <EmptyState
        icon={TbSearch}
        title='No products found'
        description="We couldn't find any products matching your current filters. Try adjusting or clearing some filters to see more results."
      />
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

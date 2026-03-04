'use client'

import { useState } from 'react'
import type {
  Product,
  Listing,
  ProductFamily,
  ListingWithProduct,
} from '@app-types/product'
import VariantSelector from '@components/listing/variantSelector'
import BetterDealNudge from '@components/listing/betterDealNudge'
import { PriceDisplay } from '@components/listing/priceDisplay'
import { PreorderBadge } from '@components/listing/preorderBadge'
import { AddToCart } from '@components/listing/addToCart'
import { ShippingInfo } from '@components/listing/shippingInfo'
import { calculateDeposit } from '@helpers'
import { findBetterDeal } from '@lib/data/families'

interface ProductDetailClientProps {
  family: ProductFamily
  product: Product
}

export default function ProductDetailClient({
  family,
  product,
}: ProductDetailClientProps) {
  const [selectedListing, setSelectedListing] = useState<Listing>(
    family.representative
  )

  const betterDeal = findBetterDeal(selectedListing, family.listings)
  const isPreorder = selectedListing.listing_type === 'preorder'
  const savings = betterDeal
    ? selectedListing.final_price_kes - betterDeal.final_price_kes
    : 0

  // Construct a ListingWithProduct for AddToCart
  const listingWithProduct: ListingWithProduct = {
    ...selectedListing,
    product,
  }

  return (
    <div className='flex flex-col gap-6'>
      <VariantSelector
        listings={family.listings}
        selectedListing={selectedListing}
        onSelect={setSelectedListing}
      />
      <BetterDealNudge betterDeal={betterDeal} savings={savings} />
      <PriceDisplay
        priceKes={selectedListing.final_price_kes}
        originalPriceKes={product.original_price_kes}
        isPreorder={isPreorder}
      />
      {isPreorder && (
        <PreorderBadge
          isPreorder={isPreorder}
          depositAmount={calculateDeposit(selectedListing.final_price_kes)}
        />
      )}
      <AddToCart listing={listingWithProduct} />
      <ShippingInfo />
    </div>
  )
}

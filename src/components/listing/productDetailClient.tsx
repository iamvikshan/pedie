'use client'

import { useState } from 'react'
import type {
  Listing,
  ProductFamily,
  ProductWithBrand,
  ListingWithProduct,
} from '@app-types/product'
import VariantSelector from '@components/listing/variantSelector'
import BetterDealNudge from '@components/listing/betterDealNudge'
import { PriceDisplay } from '@components/listing/priceDisplay'
import { PreorderBadge } from '@components/listing/preorderBadge'
import { AddToCart } from '@components/listing/addToCart'
import { ShippingInfo } from '@components/listing/shippingInfo'
import { ConditionBadge } from '@components/ui/conditionBadge'
import { calculateDeposit } from '@helpers'
import { findBetterDeal } from '@utils/products'

interface ProductDetailClientProps {
  family: ProductFamily
  product: ProductWithBrand
}

export default function ProductDetailClient({
  family,
  product,
}: ProductDetailClientProps) {
  const [selectedListing, setSelectedListing] = useState<Listing>(
    family.representative
  )
  const effectivePrice =
    selectedListing.sale_price_kes ?? selectedListing.price_kes

  const betterDeal = findBetterDeal(selectedListing, family.listings)
  const isPreorder = selectedListing.listing_type === 'preorder'
  const savings = betterDeal
    ? effectivePrice - (betterDeal.sale_price_kes ?? betterDeal.price_kes)
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
      <ConditionBadge condition={selectedListing.condition} />
      <BetterDealNudge betterDeal={betterDeal} savings={savings} />
      <PriceDisplay
        priceKes={effectivePrice}
        originalPriceKes={
          selectedListing.sale_price_kes != null
            ? selectedListing.price_kes
            : null
        }
        isPreorder={isPreorder}
      />
      {isPreorder && (
        <PreorderBadge
          isPreorder={isPreorder}
          depositAmount={calculateDeposit(effectivePrice)}
        />
      )}
      <AddToCart listing={listingWithProduct} />
      <ShippingInfo />
    </div>
  )
}

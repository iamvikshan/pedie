import { CategoryShowcase } from '@components/home/categoryShowcase'
import { CustomerFavorites } from '@components/home/customerFavorites'
import { HotDeals } from '@components/home/hotDeals'
import { HeroBanner } from '@components/home/heroBanner'
import { PopularCategories } from '@components/home/popularCategories'
import { SustainabilitySection } from '@components/home/sustainabilitySection'
import { TrustBadges } from '@components/home/trustBadges'
import { ErrorBoundary } from '@components/ui/errorBoundary'
import { getHotDealsListings } from '@data/deals'
import { getProductFamilies } from '@data/products'

export default async function Home() {
  const [productFamilies, hotDealsListings] = await Promise.all([
    getProductFamilies(12),
    getHotDealsListings(),
  ])

  return (
    <>
      <ErrorBoundary>
        <HeroBanner />
      </ErrorBoundary>
      <ErrorBoundary>
        <TrustBadges />
      </ErrorBoundary>
      <ErrorBoundary>
        <PopularCategories />
      </ErrorBoundary>
      <ErrorBoundary>
        <CustomerFavorites families={productFamilies} />
      </ErrorBoundary>
      <ErrorBoundary>
        <HotDeals listings={hotDealsListings} />
      </ErrorBoundary>
      <ErrorBoundary>
        <CategoryShowcase categorySlug='smartphones' title='Smartphones' />
      </ErrorBoundary>
      <ErrorBoundary>
        <CategoryShowcase categorySlug='laptops' title='Laptops' />
      </ErrorBoundary>
      <ErrorBoundary>
        <SustainabilitySection />
      </ErrorBoundary>
    </>
  )
}

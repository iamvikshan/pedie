import { CategoryShowcase } from '@components/home/categoryShowcase'
import { CustomerFavorites } from '@components/home/customerFavorites'
import { HotDeals } from '@components/home/hotDeals'
import { HeroBanner } from '@components/home/heroBanner'
import { PopularCategories } from '@components/home/popularCategories'
import { SustainabilitySection } from '@components/home/sustainabilitySection'
import { TrustBadges } from '@components/home/trustBadges'
import { ErrorBoundary } from '@components/ui/errorBoundary'
import { getHotDealsListings } from '@lib/data/deals'
import { getFeaturedListings } from '@lib/data/products'

export default async function Home() {
  const [featuredListings, hotDealsListings] = await Promise.all([
    getFeaturedListings(12),
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
        <CustomerFavorites listings={featuredListings} />
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

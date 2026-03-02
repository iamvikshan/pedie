import { CategoryShowcase } from '@components/home/categoryShowcase'
import { CustomerFavorites } from '@components/home/customerFavorites'
import { DailyDeals } from '@components/home/dailyDeals'
import { HeroBanner } from '@components/home/heroBanner'
import { PopularCategories } from '@components/home/popularCategories'
import { SustainabilitySection } from '@components/home/sustainabilitySection'
import { TrustBadges } from '@components/home/trustBadges'
import { ErrorBoundary } from '@components/ui/errorBoundary'
import { getDealListings, getFeaturedListings } from '@lib/data/products'

export default async function Home() {
  const [featuredListings, dealListings] = await Promise.all([
    getFeaturedListings(12),
    getDealListings(8),
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
        <DailyDeals listings={dealListings} />
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

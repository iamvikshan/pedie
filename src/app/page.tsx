import { Suspense } from 'react'
import { CategoryShowcase } from '@components/home/categoryShowcase'
import { CategoryShowcaseSkeleton } from '@components/home/categoryShowcaseSkeleton'
import { CustomerFavoritesServer } from '@components/home/customerFavoritesServer'
import { CustomerFavoritesSkeleton } from '@components/home/customerFavoritesSkeleton'
import { HotDealsServer } from '@components/home/hotDealsServer'
import { HotDealsSkeleton } from '@components/home/hotDealsSkeleton'
import { HeroBanner } from '@components/home/heroBanner'
import { PopularCategories } from '@components/home/popularCategories'
import { SustainabilitySection } from '@components/home/sustainabilitySection'
import { TrustBadges } from '@components/home/trustBadges'
import { ErrorBoundary } from '@components/ui/errorBoundary'

export default function Home() {
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
        <Suspense fallback={<CustomerFavoritesSkeleton />}>
          <CustomerFavoritesServer />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense fallback={<HotDealsSkeleton />}>
          <HotDealsServer />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense fallback={<CategoryShowcaseSkeleton />}>
          <CategoryShowcase categorySlug='smartphones' title='Smartphones' />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense fallback={<CategoryShowcaseSkeleton />}>
          <CategoryShowcase categorySlug='laptops' title='Laptops' />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <SustainabilitySection />
      </ErrorBoundary>
    </>
  )
}

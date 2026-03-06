import { Suspense } from 'react'
import { CategoryShowcaseDynamic } from '@components/home/categoryShowcaseDynamic'
import { CustomerFavoritesServer } from '@components/home/customerFavoritesServer'
import { CustomerFavoritesSkeleton } from '@components/home/customerFavoritesSkeleton'
import { HotDealsServer } from '@components/home/hotDealsServer'
import { HotDealsSkeleton } from '@components/home/hotDealsSkeleton'
import { HeroBanner } from '@components/home/heroBanner'
import { PopularCategories } from '@components/home/popularCategories'
import { PopularCategoriesSkeleton } from '@components/home/popularCategoriesSkeleton'
import { SustainabilitySection } from '@components/home/sustainabilitySection'
import { TrustBadges } from '@components/home/trustBadges'
import { TrustBanner } from '@components/home/trustBanner'
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
        <Suspense fallback={<PopularCategoriesSkeleton />}>
          <PopularCategories />
        </Suspense>
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
        <TrustBanner />
      </ErrorBoundary>
      <ErrorBoundary>
        <CategoryShowcaseDynamic />
      </ErrorBoundary>
      <ErrorBoundary>
        <SustainabilitySection />
      </ErrorBoundary>
    </>
  )
}

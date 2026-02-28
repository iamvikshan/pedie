import { HeroBanner } from '@components/home/heroBanner'
import { TrustBadges } from '@components/home/trustBadges'
import { PopularCategories } from '@components/home/popularCategories'
import { CustomerFavorites } from '@components/home/customerFavorites'
import { DailyDeals } from '@components/home/dailyDeals'
import { CategoryShowcase } from '@components/home/categoryShowcase'
import { SustainabilitySection } from '@components/home/sustainabilitySection'
import { NewsletterSignup } from '@components/home/newsletterSignup'
import { getFeaturedListings, getDealListings } from '@lib/data/products'

export default async function Home() {
  const [featuredListings, dealListings] = await Promise.all([
    getFeaturedListings(12),
    getDealListings(8),
  ])

  return (
    <>
      <HeroBanner />
      <TrustBadges />
      <PopularCategories />
      <CustomerFavorites listings={featuredListings} />
      <DailyDeals listings={dealListings} />
      <CategoryShowcase categorySlug='smartphones' title='Smartphones' />
      <CategoryShowcase categorySlug='laptops' title='Laptops' />
      <SustainabilitySection />
      <NewsletterSignup />
    </>
  )
}

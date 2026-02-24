import { HeroBanner } from '@components/home/hero-banner'
import { TrustBadges } from '@components/home/trust-badges'
import { PopularCategories } from '@components/home/popular-categories'
import { CustomerFavorites } from '@components/home/customer-favorites'
import { DailyDeals } from '@components/home/daily-deals'
import { CategoryShowcase } from '@components/home/category-showcase'
import { SustainabilitySection } from '@components/home/sustainability-section'
import { NewsletterSignup } from '@components/home/newsletter-signup'
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

import { HotDeals } from '@components/home/hotDeals'
import { getHotPromotionListings } from '@data/listings'

export async function HotDealsServer() {
  const listings = await getHotPromotionListings()
  return <HotDeals listings={listings} />
}

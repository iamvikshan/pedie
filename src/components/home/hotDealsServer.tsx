import { HotDeals } from '@components/home/hotDeals'
import { getHotDealsListings } from '@data/deals'

export async function HotDealsServer() {
  const listings = await getHotDealsListings()
  return <HotDeals listings={listings} />
}

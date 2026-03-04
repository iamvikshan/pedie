import { CustomerFavorites } from '@components/home/customerFavorites'
import { getProductFamilies } from '@data/products'

export async function CustomerFavoritesServer() {
  const families = await getProductFamilies(12)
  return <CustomerFavorites families={families} />
}

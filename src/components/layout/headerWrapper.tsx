import { getTopLevelCategories, getCategoryTree } from '@lib/data/categories'
import { getBrands } from '@lib/data/brands'
import { Header } from './header'

export async function HeaderWrapper() {
  const [topCategories, categoryTree, brands] = await Promise.all([
    getTopLevelCategories(),
    getCategoryTree(),
    getBrands(),
  ])

  return (
    <Header
      categories={topCategories}
      categoryTree={categoryTree}
      brands={brands}
    />
  )
}

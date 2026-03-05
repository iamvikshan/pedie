import { getTopLevelCategories, getCategoryTree } from '@lib/data/categories'
import { Header } from './header'

export async function HeaderWrapper() {
  const topCategories = await getTopLevelCategories()
  const categoryTree = await getCategoryTree()

  return <Header categories={topCategories} categoryTree={categoryTree} />
}

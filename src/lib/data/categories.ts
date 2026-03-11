import type { Category, CategoryWithChildren } from '@app-types/product'
import { createClient } from '@lib/supabase/server'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return (data ?? []) as Category[]
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error(`Error fetching category by slug ${slug}:`, error)
    return null
  }

  return data as Category
}

/**
 * Returns top-level categories (direct children of "Electronics").
 * Used for navigation menus and the PopularCategories section.
 */
export async function getTopLevelCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data: electronics, error: elError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'electronics')
    .single()

  if (elError || !electronics) {
    console.error('Error fetching electronics root:', elError)
    return []
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', electronics.id)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching top-level categories:', error)
    return []
  }

  return (data ?? []) as Category[]
}

/**
 * Returns the full category hierarchy as a tree of `CategoryWithChildren[]`.
 * Root nodes are categories with `parent_id = NULL`.
 */
export async function getCategoryTree(): Promise<CategoryWithChildren[]> {
  const all = await getCategories()
  const byParent = new Map<string | null, Category[]>()

  for (const cat of all) {
    const key = cat.parent_id ?? '__root__'
    const group = byParent.get(key) ?? []
    group.push(cat)
    byParent.set(key, group)
  }

  function buildTree(parentId: string | null): CategoryWithChildren[] {
    const key = parentId ?? '__root__'
    const children = byParent.get(key) ?? []
    return children.map(cat => ({
      ...cat,
      children: buildTree(cat.id),
    }))
  }

  return buildTree(null)
}

/**
 * Returns a single category by slug with its direct children.
 */
export async function getCategoryWithChildren(
  slug: string
): Promise<CategoryWithChildren | null> {
  const supabase = await createClient()

  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (catError || !category) {
    console.error(`Error fetching category ${slug}:`, catError)
    return null
  }

  const { data: children, error: childError } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', category.id)
    .order('sort_order', { ascending: true })

  if (childError) {
    console.error(`Error fetching children of ${slug}:`, childError)
    return { ...(category as Category), children: [] }
  }

  return {
    ...(category as Category),
    children: (children ?? []) as Category[],
  }
}

/**
 * Returns a breadcrumb trail from the root to the given category.
 * Example: for "earphones" → [{name:"Electronics",slug:"electronics"}, {name:"Audio",slug:"audio"}, {name:"Earphones",slug:"earphones"}]
 */
export async function getCategoryBreadcrumb(
  slug: string
): Promise<{ name: string; slug: string }[]> {
  const all = await getCategories()
  const byId = new Map<string, Category>()
  const bySlug = new Map<string, Category>()

  for (const cat of all) {
    byId.set(cat.id, cat)
    bySlug.set(cat.slug, cat)
  }

  const target = bySlug.get(slug)
  if (!target) return []

  const trail: { name: string; slug: string }[] = []
  let current: Category | undefined = target
  const visited = new Set<string>()

  while (current) {
    if (visited.has(current.id)) break
    visited.add(current.id)
    trail.unshift({ name: current.name, slug: current.slug })
    current = current.parent_id ? byId.get(current.parent_id) : undefined
  }

  return trail
}

export async function getPrimaryCategoryForProduct(
  productId: string
): Promise<Category | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('product_categories')
    .select('category:categories(*)')
    .eq('product_id', productId)
    .eq('is_primary', true)
    .single()

  if (error || !data) {
    console.error(
      `Error fetching primary category for product ${productId}:`,
      error
    )
    return null
  }

  return (data as { category: Category | null }).category
}

/**
 * Returns the given category ID plus all descendant category IDs.
 * Useful for querying products in a parent category and all subcategories.
 */
export async function getCategoryAndDescendantIds(
  categoryId: string
): Promise<string[]> {
  const all = await getCategories()
  const byParent = new Map<string, Category[]>()

  for (const cat of all) {
    if (cat.parent_id) {
      const group = byParent.get(cat.parent_id) ?? []
      group.push(cat)
      byParent.set(cat.parent_id, group)
    }
  }

  const descendants: string[] = [categoryId]
  const queue = [categoryId]
  const visited = new Set<string>([categoryId])

  while (queue.length > 0) {
    const parentId = queue.shift()!
    const children = byParent.get(parentId) ?? []
    for (const child of children) {
      if (visited.has(child.id)) continue
      visited.add(child.id)
      descendants.push(child.id)
      queue.push(child.id)
    }
  }

  return descendants
}

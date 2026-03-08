import { createAdminClient } from '@lib/supabase/admin'

/**
 * Fetch all wishlist items for a user, joined with product data.
 */
export async function getWishlistByUser(userId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('wishlist')
    .select(
      'id, product_id, user_id, created_at, product:products(id, name, brand_id, images, brand:brands(name, slug))'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`Failed to fetch wishlist for user ${userId}:`, error.message)
    return []
  }

  return data ?? []
}

/**
 * Add a product to user's wishlist (upsert to avoid duplicates).
 */
export async function addToWishlist(userId: string, productId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('wishlist')
    .upsert(
      { user_id: userId, product_id: productId },
      { onConflict: 'user_id,product_id' }
    )
    .select()
    .single()

  if (error) {
    console.error(`Failed to add to wishlist:`, error.message)
    return null
  }

  return data
}

/**
 * Remove a product from user's wishlist.
 */
export async function removeFromWishlist(userId: string, productId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) {
    console.error(`Failed to remove from wishlist:`, error.message)
    return false
  }

  return true
}

/**
 * Check if a product is in user's wishlist.
 */
export async function isInWishlist(userId: string, productId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle()

  if (error) {
    console.error(`Failed to check wishlist for user ${userId}:`, error.message)
    return false
  }

  return !!data
}

/**
 * Get all product IDs in user's wishlist (for batch checking).
 */
export async function getWishlistProductIds(userId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('wishlist')
    .select('product_id')
    .eq('user_id', userId)

  if (error) {
    console.error(
      `Failed to fetch wishlist product IDs for user ${userId}:`,
      error.message
    )
    return []
  }

  return (data ?? []).map(item => item.product_id)
}

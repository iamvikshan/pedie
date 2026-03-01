-- Fix RLS infinite recursion on profiles table
-- Replace inline admin subqueries with a SECURITY DEFINER function
-- that bypasses RLS when checking the profiles table.
-- =============================================================================

-- 1. Create the SECURITY DEFINER helper
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN auth.uid() IS NULL THEN false
      ELSE EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
      )
    END;
$$;

ALTER FUNCTION public.is_admin() OWNER TO postgres;

-- 2. Drop all existing admin policies
-- =============================================================================
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
DROP POLICY IF EXISTS "Admin can manage products" ON products;
DROP POLICY IF EXISTS "Admin can manage listings" ON listings;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage orders" ON orders;
DROP POLICY IF EXISTS "Admin can manage order items" ON order_items;
DROP POLICY IF EXISTS "Admin can manage reviews" ON reviews;
DROP POLICY IF EXISTS "Admin can view all wishlists" ON wishlist;
DROP POLICY IF EXISTS "Admin can manage newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admin can manage price comparisons" ON price_comparisons;
DROP POLICY IF EXISTS "Admin can view sync_log" ON sync_log;

-- 3. Recreate admin policies using is_admin()
-- =============================================================================
CREATE POLICY "Admin can manage categories" ON categories FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage products" ON products FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage listings" ON listings FOR ALL USING (is_admin());
CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admin can manage profiles" ON profiles FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage orders" ON orders FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage order items" ON order_items FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage reviews" ON reviews FOR ALL USING (is_admin());
CREATE POLICY "Admin can view all wishlists" ON wishlist FOR SELECT USING (is_admin());
CREATE POLICY "Admin can manage newsletter" ON newsletter_subscribers FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage price comparisons" ON price_comparisons FOR ALL USING (is_admin());
CREATE POLICY "Admin can view sync_log" ON sync_log FOR SELECT USING (is_admin());

import { describe, expect, test } from 'bun:test'
import { resolve } from 'path'

const MIGRATION_PATH = resolve(
  import.meta.dir,
  '../../../supabase/migrations/20250800000000_schema.sql'
)

const RLS_TABLES = [
  'brands',
  'categories',
  'products',
  'product_categories',
  'listings',
  'profiles',
  'orders',
  'order_items',
  'reviews',
  'wishlist',
  'newsletter_subscribers',
  'price_comparisons',
  'sync_log',
  'sync_metadata',
  'promotions',
  'sku_sequences',
]

describe('Unified migration RLS', () => {
  let sql: string

  test('migration file exists and is readable', async () => {
    const file = Bun.file(MIGRATION_PATH)
    expect(await file.exists()).toBe(true)
    sql = await file.text()
    expect(sql.length).toBeGreaterThan(0)
  })

  test('defines is_admin() with SECURITY DEFINER', async () => {
    if (!sql) sql = await Bun.file(MIGRATION_PATH).text()

    expect(sql).toContain('is_admin()')
    expect(sql).toContain('SECURITY DEFINER')
    expect(sql).toContain("role = 'admin'")
  })

  test('enables RLS on all tables', async () => {
    if (!sql) sql = await Bun.file(MIGRATION_PATH).text()

    for (const table of RLS_TABLES) {
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)
    }
  })

  test('admin policies use is_admin() not inline subqueries', async () => {
    if (!sql) sql = await Bun.file(MIGRATION_PATH).text()

    const policyBlocks = sql.match(/CREATE POLICY[^;]*;/g) || []
    expect(policyBlocks.length).toBeGreaterThan(0)

    for (const block of policyBlocks) {
      expect(block).not.toContain(
        "EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')"
      )
    }
  })

  test('has policies for public read access on catalog tables', async () => {
    if (!sql) sql = await Bun.file(MIGRATION_PATH).text()

    expect(sql).toContain('brands_public_read')
    expect(sql).toContain('categories_public_read')
    expect(sql).toContain('products_public_read')
    expect(sql).toContain('listings_public_read')
  })

  test('has user-scoped policies for personal data', async () => {
    if (!sql) sql = await Bun.file(MIGRATION_PATH).text()

    expect(sql).toContain('profiles_owner_read')
    expect(sql).toContain('profiles_owner_update')
    expect(sql).toContain('wishlist_owner_read')
    expect(sql).toContain('orders_owner_read')
  })
})

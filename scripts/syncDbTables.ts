/**
 * Writes the database schema reference to the `db-tables` Google Sheets tab.
 * Full overwrite each run (idempotent). Run via `bun scripts/syncDbTables.ts`.
 */

import { getGoogleSheetsClient } from '@lib/sheets/sync'

const SPREADSHEET_ID = process.env.GS_SPREADSHEET_ID
if (!SPREADSHEET_ID) {
  console.error('Missing GS_SPREADSHEET_ID env var')
  process.exit(1)
}

const SHEET_NAME = 'db-tables'

const HEADER = [
  'Table Name',
  'Primary Purpose',
  'Key Columns',
  'Foreign Key Relationships',
  'RLS Access Level',
  'Indexes',
  'Notes',
]

const ROWS: string[][] = [
  [
    'brands',
    'Normalized brand registry. All products FK here -- no free-text brand names.',
    'id, name, slug, logo_url, website_url, is_active, sort_order',
    'None',
    'Public SELECT, Admin ALL',
    'brands_slug_key (unique)',
    'Includes display ordering via sort_order.',
  ],
  [
    'categories',
    'Single-parent tree for item categorization. Uses recursive CTE for descendant resolution.',
    'id, name, slug, description, image_url, icon, parent_id, is_active, sort_order',
    'parent_id -> categories.id',
    'Public SELECT, Admin ALL',
    'categories_slug_key (unique), idx_categories_parent',
    'Defines navigation paths; every category has exactly one parent.',
  ],
  [
    'products',
    'Unique item concept (brand + name). NOT a purchasable unit.',
    'id, brand_id, name, slug, description, key_features, images, specs, is_active, fts',
    'brand_id -> brands.id',
    'Public SELECT (where is_active = true), Admin ALL',
    'unique (brand_id, name), GIN on fts, products_slug_key (unique)',
    'fts maintained by trigger (brand name + product name + description).',
  ],
  [
    'product_categories',
    'Many-to-many mapping for cross-category product referencing.',
    'product_id, category_id, is_primary',
    'product_id -> products.id (CASCADE), category_id -> categories.id (CASCADE)',
    'Public SELECT, Admin ALL',
    'product_categories(category_id)',
    'Every product must have exactly one is_primary = true row.',
  ],
  [
    'listings',
    'Specific buyable unit with unique auto-generated SKU and KES pricing.',
    'id, sku, product_id, condition, color, storage, ram, battery_health, warranty_months, attributes, cost_kes, price_kes, sale_price_kes, images, quantity, listing_type, status, is_featured, admin_notes, notes, includes, source, source_url, source_id',
    'product_id -> products.id',
    "Public SELECT (where status = 'active'), Admin ALL",
    'sku (unique), product_id, status, condition, (status, listing_type)',
    'Effective price = COALESCE(sale_price_kes, price_kes). cost_kes is internal only.',
  ],
  [
    'promotions',
    'Time-bound promotional events and badges. Supports flash sales, deals, clearance, featured, seasonal.',
    'id, name, type, listing_id, product_id, discount_pct, discount_amount_kes, starts_at, ends_at, is_active, sort_order',
    'listing_id -> listings.id, product_id -> products.id',
    'Public SELECT (active only), Admin ALL',
    '(listing_id, is_active), (product_id, is_active), (starts_at, ends_at)',
    'discount_pct and discount_amount_kes are mutually exclusive. listing_id and product_id are mutually exclusive.',
  ],
  [
    'profiles',
    'Extended user data linked to auth.users. Supports username-based login.',
    'id, username, full_name, avatar_url, phone, address, role, is_active, last_login_at',
    'id -> auth.users.id (CASCADE)',
    'Owner Read/Write, Admin All',
    'profiles(username) (unique)',
    'Strict regex for usernames; reserved list blocks system names. Role changes blocked by enforce_role_immutability trigger.',
  ],
  [
    'orders',
    'Customer order transaction records with KES pricing.',
    'id, user_id, status, payment_method, payment_ref, subtotal_kes, shipping_fee_kes, total_kes, deposit_amount_kes, balance_due_kes, shipping_address, tracking_info, notes',
    'user_id -> profiles.id',
    'Owner Read/Create, Admin All',
    'idx_orders_user, idx_orders_status',
    'Snapshots shipping address at order time. Supports preorder deposits.',
  ],
  [
    'order_items',
    'Individual line items within an order. Snapshots product details at purchase time.',
    'id, order_id, listing_id, product_name, variant_summary, quantity, unit_price_kes, deposit_kes',
    'order_id -> orders.id (CASCADE), listing_id -> listings.id',
    'Owner Read/Create, Admin All',
    'idx_order_items_order, idx_order_items_listing',
    'listing_id nullable (preserved if listing later deleted).',
  ],
  [
    'reviews',
    'Product ratings and text feedback from verified purchasers.',
    'id, product_id, user_id, rating, title, body, verified_purchase',
    'product_id -> products.id, user_id -> profiles.id',
    'Public SELECT, Owner CRUD, Admin All',
    'idx_reviews_product, idx_reviews_user',
    'verified_purchase auto-set if user has a delivered order for the product.',
  ],
  [
    'wishlist',
    'User-saved products for future interest.',
    'id, user_id, product_id',
    'user_id -> profiles.id, product_id -> products.id',
    'Owner CRUD, Admin All',
    'idx_wishlist_user, idx_wishlist_product, unique(user_id, product_id)',
    'Ensures one entry per user-product pair.',
  ],
  [
    'newsletter_subscribers',
    'Email marketing subscriber registry with opt-out support.',
    'id, email, subscribed, subscribed_at',
    'None',
    'Public INSERT, Admin ALL',
    'newsletter_subscribers_email_key (unique)',
    'subscribed column allows soft opt-out without deleting the row.',
  ],
  [
    'price_comparisons',
    'Competitor pricing data from crawlers (currently paused).',
    'id, product_id, competitor, competitor_price_kes, url, crawled_at',
    'product_id -> products.id',
    'Public SELECT, Admin ALL',
    'idx_price_comparisons_product, idx_price_comparisons_crawled, unique(product_id, competitor, crawled_utc_date)',
    'Uses crawled_utc_date() immutable function for unique constraint.',
  ],
  [
    'sync_metadata',
    'Provenance tracking for data synced from external sources (Sheets, crawlers).',
    'id, listing_id, product_id, source, source_id, sheet_row_id, last_synced_at, raw_data',
    'listing_id -> listings.id (SET NULL), product_id -> products.id (SET NULL)',
    'Admin SELECT only',
    'sync_metadata(listing_id), sync_metadata(product_id)',
    'Replaces old sheet_row_id column that was on listings table.',
  ],
  [
    'admin_log',
    'Audit trail for sync operations and admin actions.',
    'id, triggered_by, status, rows_synced, errors, started_at, completed_at, actor_id, action, entity_type, entity_id, details',
    'actor_id -> profiles.id',
    'Admin SELECT, Service Role INSERT',
    'admin_log_pkey',
    'Renamed from sync_log. Extended with actor_id, action, entity_type, entity_id, details columns.',
  ],
  [
    'sku_sequences',
    'Helper table for SKU auto-generation sequential numbering.',
    'prefix, seq',
    'None',
    'None (internal, accessed by generate_sku function only)',
    'sku_sequences_pkey',
    'Used by generate_sku() trigger function on listings INSERT.',
  ],
]

try {
  const sheets = getGoogleSheetsClient()
  const data = [HEADER, ...ROWS]

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME,
  })

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: data },
  })

  console.log(`Wrote ${ROWS.length} rows to ${SHEET_NAME} sheet`)
} catch (err) {
  console.error(
    'Failed to sync db-tables:',
    err instanceof Error ? err.message : err
  )
  process.exit(1)
}

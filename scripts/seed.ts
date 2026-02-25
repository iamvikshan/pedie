/**
 * Seed script for Pedie Tech e-commerce store
 * Populates the database with realistic Kenyan refurbished electronics data.
 *
 * Usage: bun scripts/seed.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@app-types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env'
  )
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const categories = [
  {
    name: 'Smartphones',
    slug: 'smartphones',
    sort_order: 1,
    image_url: '/images/categories/smartphones.webp',
  },
  {
    name: 'Laptops',
    slug: 'laptops',
    sort_order: 2,
    image_url: '/images/categories/laptops.webp',
  },
  {
    name: 'Tablets',
    slug: 'tablets',
    sort_order: 3,
    image_url: '/images/categories/tablets.webp',
  },
  {
    name: 'Wearables',
    slug: 'wearables',
    sort_order: 4,
    image_url: '/images/categories/wearables.webp',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    sort_order: 5,
    image_url: '/images/categories/accessories.webp',
  },
]

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
interface ProductSeed {
  brand: string
  model: string
  slug: string
  category_slug: string
  description: string
  original_price_kes: number
  key_features: string[]
  specs: Record<string, string>
}

const products: ProductSeed[] = [
  // Smartphones
  {
    brand: 'Apple',
    model: 'iPhone 16 Pro Max',
    slug: 'apple-iphone-16-pro-max',
    category_slug: 'smartphones',
    description:
      'Latest flagship with A18 Pro chip, 48MP camera system, and titanium design.',
    original_price_kes: 250000,
    key_features: [
      'A18 Pro chip',
      '48MP main camera',
      'Titanium design',
      'Action button',
      'USB-C',
    ],
    specs: {
      display: '6.9" Super Retina XDR OLED',
      chip: 'A18 Pro',
      storage: '256GB / 512GB / 1TB',
      battery: '4685 mAh',
    },
  },
  {
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    slug: 'apple-iphone-15-pro',
    category_slug: 'smartphones',
    description:
      'Pro-level performance with A17 Pro chip and advanced camera system.',
    original_price_kes: 195000,
    key_features: [
      'A17 Pro chip',
      '48MP main camera',
      'Titanium frame',
      'USB-C',
      'Action button',
    ],
    specs: {
      display: '6.1" Super Retina XDR OLED',
      chip: 'A17 Pro',
      storage: '128GB / 256GB / 512GB / 1TB',
      battery: '3274 mAh',
    },
  },
  {
    brand: 'Apple',
    model: 'iPhone 14',
    slug: 'apple-iphone-14',
    category_slug: 'smartphones',
    description:
      'Reliable everyday iPhone with A15 Bionic and excellent camera.',
    original_price_kes: 130000,
    key_features: [
      'A15 Bionic',
      'Dual camera',
      'Crash Detection',
      'Super Retina XDR',
    ],
    specs: {
      display: '6.1" Super Retina XDR OLED',
      chip: 'A15 Bionic',
      storage: '128GB / 256GB / 512GB',
      battery: '3279 mAh',
    },
  },
  {
    brand: 'Apple',
    model: 'iPhone 13',
    slug: 'apple-iphone-13',
    category_slug: 'smartphones',
    description:
      'Great value with A15 Bionic chip, dual cameras, and all-day battery.',
    original_price_kes: 95000,
    key_features: [
      'A15 Bionic',
      'Dual 12MP cameras',
      'Ceramic Shield',
      '5G capable',
    ],
    specs: {
      display: '6.1" Super Retina XDR OLED',
      chip: 'A15 Bionic',
      storage: '128GB / 256GB / 512GB',
      battery: '3240 mAh',
    },
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    category_slug: 'smartphones',
    description:
      'Samsung flagship with Galaxy AI, S Pen, and 200MP camera system.',
    original_price_kes: 220000,
    key_features: [
      'Snapdragon 8 Gen 3',
      '200MP camera',
      'S Pen included',
      'Galaxy AI',
      'Titanium frame',
    ],
    specs: {
      display: '6.8" Dynamic AMOLED 2X',
      chip: 'Snapdragon 8 Gen 3',
      storage: '256GB / 512GB / 1TB',
      battery: '5000 mAh',
    },
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S23',
    slug: 'samsung-galaxy-s23',
    category_slug: 'smartphones',
    description:
      'Compact flagship with Snapdragon 8 Gen 2, 50MP camera, and all-day battery.',
    original_price_kes: 130000,
    key_features: [
      'Snapdragon 8 Gen 2',
      '50MP camera',
      'Gorilla Glass Victus 2',
      'IP68',
    ],
    specs: {
      display: '6.1" Dynamic AMOLED 2X',
      chip: 'Snapdragon 8 Gen 2',
      storage: '128GB / 256GB',
      battery: '3900 mAh',
    },
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S22',
    slug: 'samsung-galaxy-s22',
    category_slug: 'smartphones',
    description: 'Previous gen flagship at excellent value.',
    original_price_kes: 95000,
    key_features: [
      'Snapdragon 8 Gen 1',
      '50MP camera',
      'Nightography',
      'Vision Booster',
    ],
    specs: {
      display: '6.1" Dynamic AMOLED 2X',
      chip: 'Snapdragon 8 Gen 1',
      storage: '128GB / 256GB',
      battery: '3700 mAh',
    },
  },
  {
    brand: 'Google',
    model: 'Pixel 8 Pro',
    slug: 'google-pixel-8-pro',
    category_slug: 'smartphones',
    description: 'Google AI-powered phone with best-in-class camera.',
    original_price_kes: 155000,
    key_features: [
      'Tensor G3',
      '50MP camera',
      'Magic Eraser',
      '7 years of updates',
      'Temperature sensor',
    ],
    specs: {
      display: '6.7" LTPO OLED',
      chip: 'Tensor G3',
      storage: '128GB / 256GB / 512GB / 1TB',
      battery: '5050 mAh',
    },
  },
  {
    brand: 'Google',
    model: 'Pixel 7a',
    slug: 'google-pixel-7a',
    category_slug: 'smartphones',
    description: 'Affordable Pixel experience with flagship camera features.',
    original_price_kes: 65000,
    key_features: ['Tensor G2', '64MP camera', 'Magic Eraser', '90Hz display'],
    specs: {
      display: '6.1" OLED 90Hz',
      chip: 'Tensor G2',
      storage: '128GB',
      battery: '4385 mAh',
    },
  },
  // Laptops
  {
    brand: 'Apple',
    model: 'MacBook Air M2',
    slug: 'apple-macbook-air-m2',
    category_slug: 'laptops',
    description:
      'Ultra-thin and light laptop with M2 chip for all-day productivity.',
    original_price_kes: 180000,
    key_features: [
      'M2 chip',
      '13.6" Liquid Retina',
      '18-hour battery',
      'MagSafe charging',
      'Fanless design',
    ],
    specs: {
      display: '13.6" Liquid Retina',
      chip: 'Apple M2',
      ram: '8GB / 16GB / 24GB',
      storage: '256GB / 512GB / 1TB / 2TB SSD',
    },
  },
  {
    brand: 'Apple',
    model: 'MacBook Pro 14" M3 Pro',
    slug: 'apple-macbook-pro-14-m3-pro',
    category_slug: 'laptops',
    description:
      'Professional-grade laptop with M3 Pro chip for demanding workflows.',
    original_price_kes: 320000,
    key_features: [
      'M3 Pro chip',
      '14.2" Liquid Retina XDR',
      '18-hour battery',
      'HDMI + SD slot',
      'ProMotion 120Hz',
    ],
    specs: {
      display: '14.2" Liquid Retina XDR',
      chip: 'Apple M3 Pro',
      ram: '18GB / 36GB',
      storage: '512GB / 1TB / 2TB SSD',
    },
  },
  {
    brand: 'Lenovo',
    model: 'ThinkPad X1 Carbon Gen 11',
    slug: 'lenovo-thinkpad-x1-carbon-gen-11',
    category_slug: 'laptops',
    description:
      'Business ultrabook with Intel 13th Gen and legendary ThinkPad keyboard.',
    original_price_kes: 250000,
    key_features: [
      'Intel Core i7-1365U',
      '14" 2.8K OLED',
      'MIL-STD-810H',
      '1.12kg',
    ],
    specs: {
      display: '14" 2.8K OLED',
      chip: 'Intel Core i7-1365U',
      ram: '16GB / 32GB',
      storage: '512GB / 1TB SSD',
    },
  },
  // Tablets
  {
    brand: 'Apple',
    model: 'iPad Air M2',
    slug: 'apple-ipad-air-m2',
    category_slug: 'tablets',
    description:
      'Versatile tablet with M2 chip, Apple Pencil Pro support, and stunning display.',
    original_price_kes: 110000,
    key_features: [
      'M2 chip',
      '11" Liquid Retina',
      'Apple Pencil Pro',
      'USB-C',
      'Touch ID',
    ],
    specs: {
      display: '11" Liquid Retina',
      chip: 'Apple M2',
      storage: '128GB / 256GB / 512GB / 1TB',
      connectivity: 'Wi-Fi 6E / 5G',
    },
  },
  {
    brand: 'Apple',
    model: 'iPad 10th Gen',
    slug: 'apple-ipad-10th-gen',
    category_slug: 'tablets',
    description:
      'Affordable iPad with A14 Bionic and modern all-screen design.',
    original_price_kes: 60000,
    key_features: [
      'A14 Bionic',
      '10.9" Liquid Retina',
      'USB-C',
      'Touch ID',
      '5G optional',
    ],
    specs: {
      display: '10.9" Liquid Retina',
      chip: 'A14 Bionic',
      storage: '64GB / 256GB',
      connectivity: 'Wi-Fi 6 / 5G',
    },
  },
  {
    brand: 'Samsung',
    model: 'Galaxy Tab S9',
    slug: 'samsung-galaxy-tab-s9',
    category_slug: 'tablets',
    description:
      'Premium Android tablet with S Pen and stunning AMOLED display.',
    original_price_kes: 115000,
    key_features: [
      'Snapdragon 8 Gen 2',
      '11" Dynamic AMOLED 2X',
      'S Pen included',
      'IP68',
    ],
    specs: {
      display: '11" Dynamic AMOLED 2X',
      chip: 'Snapdragon 8 Gen 2',
      storage: '128GB / 256GB',
      connectivity: 'Wi-Fi 6E / 5G',
    },
  },
  // Wearables
  {
    brand: 'Apple',
    model: 'Apple Watch Series 9',
    slug: 'apple-watch-series-9',
    category_slug: 'wearables',
    description:
      'Smartwatch with S9 SiP, Double Tap gesture, and health monitoring.',
    original_price_kes: 65000,
    key_features: [
      'S9 SiP',
      'Double Tap',
      'Always-On Retina',
      'Blood oxygen',
      'ECG',
    ],
    specs: {
      display: 'Always-On Retina LTPO OLED',
      chip: 'S9 SiP',
      sizes: '41mm / 45mm',
      water_resistance: 'WR50',
    },
  },
  {
    brand: 'Samsung',
    model: 'Galaxy Watch 6',
    slug: 'samsung-galaxy-watch-6',
    category_slug: 'wearables',
    description:
      'Wear OS smartwatch with BIA sensor and comprehensive health tracking.',
    original_price_kes: 45000,
    key_features: [
      'Exynos W930',
      'BIA sensor',
      'Sleep coaching',
      'Wear OS',
      'Sapphire Crystal',
    ],
    specs: {
      display: 'Super AMOLED',
      chip: 'Exynos W930',
      sizes: '40mm / 44mm',
      water_resistance: '5ATM + IP68',
    },
  },
  // Accessories
  {
    brand: 'Apple',
    model: 'AirPods Pro 2',
    slug: 'apple-airpods-pro-2',
    category_slug: 'accessories',
    description:
      'Premium earbuds with adaptive noise cancellation and USB-C case.',
    original_price_kes: 40000,
    key_features: [
      'H2 chip',
      'Adaptive ANC',
      'Spatial Audio',
      'USB-C MagSafe case',
    ],
    specs: {
      chip: 'Apple H2',
      anc: 'Adaptive',
      battery: '6h (30h with case)',
      water_resistance: 'IPX4',
    },
  },
  {
    brand: 'Samsung',
    model: 'Galaxy Buds3 Pro',
    slug: 'samsung-galaxy-buds3-pro',
    category_slug: 'accessories',
    description:
      'Premium earbuds with Galaxy AI-enhanced audio and blade design.',
    original_price_kes: 32000,
    key_features: [
      'Galaxy AI',
      'Adaptive ANC',
      '360 Audio',
      'Blade design',
      'IP57',
    ],
    specs: {
      anc: 'Adaptive',
      battery: '7h (30h with case)',
      water_resistance: 'IP57',
      connectivity: 'Bluetooth 5.4',
    },
  },
]

// ---------------------------------------------------------------------------
// Listings (per product - realistic pricing with condition/storage variants)
// ---------------------------------------------------------------------------
interface ListingSeed {
  product_slug: string
  storage: string
  color: string
  condition: 'acceptable' | 'good' | 'excellent' | 'premium'
  battery_health: number
  price_kes: number
  original_price_usd: number
  source: string
}

const listings: ListingSeed[] = [
  // iPhone 16 Pro Max
  {
    product_slug: 'apple-iphone-16-pro-max',
    storage: '256GB',
    color: 'Natural Titanium',
    condition: 'excellent',
    battery_health: 97,
    price_kes: 195000,
    original_price_usd: 1099,
    source: 'swappa',
  },
  {
    product_slug: 'apple-iphone-16-pro-max',
    storage: '512GB',
    color: 'Black Titanium',
    condition: 'premium',
    battery_health: 100,
    price_kes: 225000,
    original_price_usd: 1299,
    source: 'backmarket',
  },
  // iPhone 15 Pro
  {
    product_slug: 'apple-iphone-15-pro',
    storage: '256GB',
    color: 'Blue Titanium',
    condition: 'good',
    battery_health: 90,
    price_kes: 135000,
    original_price_usd: 899,
    source: 'swappa',
  },
  {
    product_slug: 'apple-iphone-15-pro',
    storage: '128GB',
    color: 'Natural Titanium',
    condition: 'excellent',
    battery_health: 94,
    price_kes: 145000,
    original_price_usd: 799,
    source: 'backmarket',
  },
  // iPhone 14
  {
    product_slug: 'apple-iphone-14',
    storage: '128GB',
    color: 'Midnight',
    condition: 'good',
    battery_health: 88,
    price_kes: 82000,
    original_price_usd: 599,
    source: 'backmarket',
  },
  {
    product_slug: 'apple-iphone-14',
    storage: '256GB',
    color: 'Starlight',
    condition: 'acceptable',
    battery_health: 82,
    price_kes: 75000,
    original_price_usd: 699,
    source: 'swappa',
  },
  // iPhone 13
  {
    product_slug: 'apple-iphone-13',
    storage: '128GB',
    color: 'Midnight',
    condition: 'good',
    battery_health: 85,
    price_kes: 58000,
    original_price_usd: 429,
    source: 'backmarket',
  },
  {
    product_slug: 'apple-iphone-13',
    storage: '256GB',
    color: 'Blue',
    condition: 'excellent',
    battery_health: 92,
    price_kes: 68000,
    original_price_usd: 529,
    source: 'swappa',
  },
  // Galaxy S24 Ultra
  {
    product_slug: 'samsung-galaxy-s24-ultra',
    storage: '256GB',
    color: 'Titanium Black',
    condition: 'excellent',
    battery_health: 96,
    price_kes: 168000,
    original_price_usd: 1099,
    source: 'swappa',
  },
  {
    product_slug: 'samsung-galaxy-s24-ultra',
    storage: '512GB',
    color: 'Titanium Violet',
    condition: 'premium',
    battery_health: 100,
    price_kes: 198000,
    original_price_usd: 1299,
    source: 'backmarket',
  },
  // Galaxy S23
  {
    product_slug: 'samsung-galaxy-s23',
    storage: '128GB',
    color: 'Phantom Black',
    condition: 'good',
    battery_health: 89,
    price_kes: 78000,
    original_price_usd: 599,
    source: 'backmarket',
  },
  // Galaxy S22
  {
    product_slug: 'samsung-galaxy-s22',
    storage: '128GB',
    color: 'Green',
    condition: 'acceptable',
    battery_health: 82,
    price_kes: 52000,
    original_price_usd: 399,
    source: 'swappa',
  },
  // Pixel 8 Pro
  {
    product_slug: 'google-pixel-8-pro',
    storage: '128GB',
    color: 'Obsidian',
    condition: 'excellent',
    battery_health: 95,
    price_kes: 105000,
    original_price_usd: 749,
    source: 'swappa',
  },
  {
    product_slug: 'google-pixel-8-pro',
    storage: '256GB',
    color: 'Bay',
    condition: 'good',
    battery_health: 90,
    price_kes: 98000,
    original_price_usd: 849,
    source: 'backmarket',
  },
  // Pixel 7a
  {
    product_slug: 'google-pixel-7a',
    storage: '128GB',
    color: 'Charcoal',
    condition: 'good',
    battery_health: 91,
    price_kes: 38000,
    original_price_usd: 349,
    source: 'swappa',
  },
  // MacBook Air M2
  {
    product_slug: 'apple-macbook-air-m2',
    storage: '256GB',
    color: 'Midnight',
    condition: 'excellent',
    battery_health: 94,
    price_kes: 125000,
    original_price_usd: 899,
    source: 'backmarket',
  },
  {
    product_slug: 'apple-macbook-air-m2',
    storage: '512GB',
    color: 'Starlight',
    condition: 'good',
    battery_health: 88,
    price_kes: 138000,
    original_price_usd: 1099,
    source: 'swappa',
  },
  // MacBook Pro 14" M3 Pro
  {
    product_slug: 'apple-macbook-pro-14-m3-pro',
    storage: '512GB',
    color: 'Space Black',
    condition: 'premium',
    battery_health: 99,
    price_kes: 275000,
    original_price_usd: 1799,
    source: 'backmarket',
  },
  // ThinkPad X1 Carbon
  {
    product_slug: 'lenovo-thinkpad-x1-carbon-gen-11',
    storage: '512GB',
    color: 'Black',
    condition: 'good',
    battery_health: 87,
    price_kes: 165000,
    original_price_usd: 1399,
    source: 'backmarket',
  },
  // iPad Air M2
  {
    product_slug: 'apple-ipad-air-m2',
    storage: '128GB',
    color: 'Space Gray',
    condition: 'excellent',
    battery_health: 95,
    price_kes: 78000,
    original_price_usd: 599,
    source: 'swappa',
  },
  {
    product_slug: 'apple-ipad-air-m2',
    storage: '256GB',
    color: 'Starlight',
    condition: 'good',
    battery_health: 90,
    price_kes: 85000,
    original_price_usd: 699,
    source: 'backmarket',
  },
  // iPad 10th Gen
  {
    product_slug: 'apple-ipad-10th-gen',
    storage: '64GB',
    color: 'Blue',
    condition: 'good',
    battery_health: 88,
    price_kes: 38000,
    original_price_usd: 349,
    source: 'swappa',
  },
  // Galaxy Tab S9
  {
    product_slug: 'samsung-galaxy-tab-s9',
    storage: '128GB',
    color: 'Graphite',
    condition: 'excellent',
    battery_health: 96,
    price_kes: 82000,
    original_price_usd: 649,
    source: 'backmarket',
  },
  // Apple Watch Series 9
  {
    product_slug: 'apple-watch-series-9',
    storage: '32GB',
    color: 'Midnight Aluminum',
    condition: 'excellent',
    battery_health: 97,
    price_kes: 45000,
    original_price_usd: 329,
    source: 'swappa',
  },
  // Galaxy Watch 6
  {
    product_slug: 'samsung-galaxy-watch-6',
    storage: '16GB',
    color: 'Graphite',
    condition: 'good',
    battery_health: 92,
    price_kes: 28000,
    original_price_usd: 249,
    source: 'backmarket',
  },
  // AirPods Pro 2
  {
    product_slug: 'apple-airpods-pro-2',
    storage: 'N/A',
    color: 'White',
    condition: 'excellent',
    battery_health: 98,
    price_kes: 28000,
    original_price_usd: 199,
    source: 'backmarket',
  },
  {
    product_slug: 'apple-airpods-pro-2',
    storage: 'N/A',
    color: 'White',
    condition: 'good',
    battery_health: 90,
    price_kes: 22000,
    original_price_usd: 199,
    source: 'swappa',
  },
  // Galaxy Buds3 Pro
  {
    product_slug: 'samsung-galaxy-buds3-pro',
    storage: 'N/A',
    color: 'Silver',
    condition: 'premium',
    battery_health: 100,
    price_kes: 25000,
    original_price_usd: 179,
    source: 'backmarket',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let listingCounter = 1000

function generateListingId(): string {
  listingCounter++
  return `PD-${String(listingCounter).padStart(5, '0')}`
}

// ---------------------------------------------------------------------------
// Seed execution
// ---------------------------------------------------------------------------
async function seed() {
  console.log('🌱 Starting seed...\n')

  // 1. Insert categories
  console.log('📁 Inserting categories...')
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' })
    .select('id, slug')

  if (catError) {
    console.error('❌ Categories error:', catError.message)
    process.exit(1)
  }
  console.log(`   ✅ ${catData.length} categories inserted`)

  const categoryMap = new Map(catData.map(c => [c.slug, c.id]))

  // 2. Insert products
  console.log('📦 Inserting products...')
  const productRows = products.map(p => ({
    brand: p.brand,
    model: p.model,
    slug: p.slug,
    category_id: categoryMap.get(p.category_slug) ?? null,
    description: p.description,
    original_price_kes: p.original_price_kes,
    key_features: p.key_features,
    specs: p.specs,
  }))

  const { data: prodData, error: prodError } = await supabase
    .from('products')
    .upsert(productRows, { onConflict: 'slug' })
    .select('id, slug')

  if (prodError) {
    console.error('❌ Products error:', prodError.message)
    process.exit(1)
  }
  console.log(`   ✅ ${prodData.length} products inserted`)

  const productMap = new Map(prodData.map(p => [p.slug, p.id]))

  // 3. Insert listings
  console.log('🏷️  Inserting listings...')
  const listingRows = listings.map(l => {
    const productId = productMap.get(l.product_slug)
    if (!productId) {
      throw new Error(`Product not found for slug: ${l.product_slug}`)
    }
    return {
      listing_id: generateListingId(),
      product_id: productId,
      storage: l.storage,
      color: l.color,
      condition: l.condition,
      battery_health: l.battery_health,
      price_kes: l.price_kes,
      original_price_usd: l.original_price_usd,
      landed_cost_kes: Math.round(l.original_price_usd * 130 * 1.15),
      source: l.source,
      status: 'available' as const,
      is_featured: l.condition === 'premium' || l.condition === 'excellent',
    }
  })

  const { data: listData, error: listError } = await supabase
    .from('listings')
    .upsert(listingRows, { onConflict: 'listing_id' })
    .select('id')

  if (listError) {
    console.error('❌ Listings error:', listError.message)
    process.exit(1)
  }
  console.log(`   ✅ ${listData.length} listings inserted`)

  // 4. Insert newsletter subscriber
  console.log('📧 Inserting sample newsletter subscriber...')
  const { error: newsError } = await supabase
    .from('newsletter_subscribers')
    .upsert([{ email: 'demo@pedie.tech' }], { onConflict: 'email' })

  if (newsError) {
    console.error('❌ Newsletter error:', newsError.message)
  } else {
    console.log('   ✅ 1 newsletter subscriber inserted')
  }

  console.log('\n🎉 Seed complete!')
  console.log(`   Categories: ${catData.length}`)
  console.log(`   Products:   ${prodData.length}`)
  console.log(`   Listings:   ${listData.length}`)
}

seed().catch(err => {
  console.error('Fatal seed error:', err)
  process.exit(1)
})

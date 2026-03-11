/**
 * Seed script for Pedie Tech e-commerce store
 * Populates the database with realistic Kenyan refurbished electronics data.
 *
 * Usage: bun scripts/seed.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import type { Database } from '@app-types/database'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env'
  )
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const STORAGE_BASE = `${supabaseUrl}/storage/v1/object/public/product-images`

// ---------------------------------------------------------------------------
// Categories (hierarchical)
// ---------------------------------------------------------------------------
interface CategorySeed {
  name: string
  slug: string
  description?: string
  icon?: string
  sort_order: number
  image_url?: string
  parent_slug?: string
}

const categories: CategorySeed[] = [
  // Root
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'All electronic devices and accessories',
    icon: 'TbDevices',
    sort_order: 0,
  },
  // Top-level (children of Electronics)
  {
    name: 'Smartphones',
    slug: 'smartphones',
    icon: 'TbDeviceMobile',
    sort_order: 1,
    image_url: '/images/categories/smartphones.svg',
    parent_slug: 'electronics',
  },
  {
    name: 'Laptops',
    slug: 'laptops',
    icon: 'TbDeviceLaptop',
    sort_order: 2,
    image_url: '/images/categories/laptops.svg',
    parent_slug: 'electronics',
  },
  {
    name: 'Tablets',
    slug: 'tablets',
    icon: 'TbDeviceTablet',
    sort_order: 3,
    image_url: '/images/categories/tablets.svg',
    parent_slug: 'electronics',
  },
  {
    name: 'Wearables',
    slug: 'wearables',
    icon: 'TbDeviceWatch',
    sort_order: 4,
    image_url: '/images/categories/wearables.svg',
    parent_slug: 'electronics',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    icon: 'TbPlug',
    sort_order: 5,
    image_url: '/images/categories/accessories.svg',
    parent_slug: 'electronics',
  },
  {
    name: 'Audio',
    slug: 'audio',
    description: 'Audio equipment and accessories',
    icon: 'TbHeadphones',
    sort_order: 6,
    parent_slug: 'electronics',
  },
  // Other Electronics
  {
    name: 'Desktop Computers',
    slug: 'desktop-computers',
    description: 'Desktop PCs and all-in-ones',
    icon: 'TbDeviceDesktop',
    sort_order: 7,
    parent_slug: 'electronics',
  },
  {
    name: 'Portable Power Banks',
    slug: 'portable-power-banks',
    description: 'Portable battery packs and power stations',
    icon: 'TbBattery',
    sort_order: 8,
    parent_slug: 'electronics',
  },
  {
    name: 'Cameras',
    slug: 'cameras',
    description: 'Digital cameras and action cameras',
    icon: 'TbCamera',
    sort_order: 9,
    parent_slug: 'electronics',
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    description: 'Gaming consoles, handhelds, and gaming accessories',
    icon: 'TbDeviceGamepad2',
    sort_order: 10,
    image_url: '/images/categories/gaming.svg',
    parent_slug: 'electronics',
  },
  {
    name: 'Camera Accessories',
    slug: 'camera-accessories',
    description: 'Lenses, tripods, and camera gear',
    icon: 'TbCameraPlus',
    sort_order: 11,
    parent_slug: 'electronics',
  },
  {
    name: 'VR Headsets',
    slug: 'vr-headsets',
    description: 'Virtual reality headsets',
    icon: 'TbDeviceVisionPro',
    sort_order: 12,
    parent_slug: 'electronics',
  },
  {
    name: 'VR Headset Accessories',
    slug: 'vr-headset-accessories',
    description: 'Controllers, straps, and VR accessories',
    sort_order: 13,
    parent_slug: 'electronics',
  },
  // Gaming subcategories
  {
    name: 'Gaming Consoles',
    slug: 'gaming-consoles',
    description: 'Home gaming consoles from top brands',
    sort_order: 1,
    parent_slug: 'gaming',
  },
  {
    name: 'Gaming Handhelds',
    slug: 'gaming-handhelds',
    description: 'Portable gaming devices',
    sort_order: 2,
    parent_slug: 'gaming',
  },
  {
    name: 'Gaming Accessories',
    slug: 'gaming-accessories',
    description: 'Controllers, headsets, and gaming gear',
    sort_order: 3,
    parent_slug: 'gaming',
  },
  // Wearables subcategories
  {
    name: 'Smartwatches',
    slug: 'smartwatches',
    description: 'Smart wristwatches from top brands',
    sort_order: 1,
    parent_slug: 'wearables',
  },
  {
    name: 'Smart Rings',
    slug: 'smart-rings',
    description: 'Smart rings for health and fitness tracking',
    sort_order: 2,
    parent_slug: 'wearables',
  },
  // Accessories subcategories
  {
    name: 'Phone Accessories',
    slug: 'phone-accessories',
    description: 'Cases, chargers, cables, and more for smartphones',
    sort_order: 1,
    parent_slug: 'accessories',
  },
  {
    name: 'Screen Protectors',
    slug: 'screen-protectors',
    description: 'Tempered glass and film protectors',
    sort_order: 2,
    parent_slug: 'accessories',
  },
  {
    name: 'Phone Cases',
    slug: 'phone-cases',
    description: 'Protective cases and covers',
    sort_order: 3,
    parent_slug: 'accessories',
  },
  {
    name: 'Chargers',
    slug: 'chargers',
    description: 'Wired and wireless chargers',
    sort_order: 4,
    parent_slug: 'accessories',
  },
  {
    name: 'Charging & Data Cables',
    slug: 'charging-data-cables',
    description: 'USB-C, Lightning, and other cables',
    sort_order: 5,
    parent_slug: 'accessories',
  },
  {
    name: 'Computer Accessories',
    slug: 'computer-accessories',
    description: 'Keyboards, mice, and more for computers',
    sort_order: 6,
    parent_slug: 'accessories',
  },
  {
    name: 'Keyboards',
    slug: 'keyboards',
    description: 'Mechanical and membrane keyboards',
    sort_order: 7,
    parent_slug: 'accessories',
  },
  {
    name: 'Mice',
    slug: 'mice',
    description: 'Wired and wireless mice',
    sort_order: 8,
    parent_slug: 'accessories',
  },
  {
    name: 'Laptop Accessories',
    slug: 'laptop-accessories',
    description: 'Bags, stands, docks, and more',
    sort_order: 9,
    parent_slug: 'accessories',
  },
  {
    name: 'Smartwatch Accessories',
    slug: 'smartwatch-accessories',
    description: 'Bands, chargers, and protectors for smartwatches',
    sort_order: 10,
    parent_slug: 'accessories',
  },
  {
    name: 'Tablet Accessories',
    slug: 'tablet-accessories',
    description: 'Cases, keyboards, and styluses for tablets',
    sort_order: 11,
    parent_slug: 'accessories',
  },
  // Audio subcategories
  {
    name: 'Earphones',
    slug: 'earphones',
    description: 'Wired earphones and in-ear monitors',
    sort_order: 1,
    parent_slug: 'audio',
  },
  {
    name: 'Earbuds & In-Ear Headphones',
    slug: 'earbuds',
    description: 'True wireless and in-ear headphones',
    sort_order: 2,
    parent_slug: 'audio',
  },
  {
    name: 'Headphones',
    slug: 'headphones',
    description: 'Over-ear and on-ear headphones',
    sort_order: 3,
    parent_slug: 'audio',
  },
  {
    name: 'Portable Bluetooth Speakers',
    slug: 'portable-bluetooth-speakers',
    description: 'Wireless portable speakers',
    sort_order: 4,
    parent_slug: 'audio',
  },
  {
    name: 'Speakers',
    slug: 'speakers',
    description: 'Home and desktop speakers',
    sort_order: 5,
    parent_slug: 'audio',
  },
  {
    name: 'Earphone Accessories',
    slug: 'earphone-accessories',
    description: 'Tips, cases, and adapters for earphones',
    sort_order: 6,
    parent_slug: 'audio',
  },
  {
    name: 'Microphones',
    slug: 'microphones',
    description: 'USB, condenser, and lavalier microphones',
    sort_order: 7,
    parent_slug: 'audio',
  },
]

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------
interface BrandSeed {
  name: string
  slug: string
  logo_url?: string
  website_url?: string
  sort_order: number
}

const brands: BrandSeed[] = [
  {
    name: 'Apple',
    slug: 'apple',
    website_url: 'https://apple.com',
    sort_order: 0,
  },
  {
    name: 'Samsung',
    slug: 'samsung',
    website_url: 'https://samsung.com',
    sort_order: 1,
  },
  {
    name: 'Google',
    slug: 'google',
    website_url: 'https://store.google.com',
    sort_order: 2,
  },
  {
    name: 'Lenovo',
    slug: 'lenovo',
    website_url: 'https://lenovo.com',
    sort_order: 3,
  },
  {
    name: 'Nintendo',
    slug: 'nintendo',
    website_url: 'https://nintendo.com',
    sort_order: 4,
  },
  {
    name: 'Sony',
    slug: 'sony',
    website_url: 'https://sony.com',
    sort_order: 5,
  },
  {
    name: 'Valve',
    slug: 'valve',
    website_url: 'https://store.steampowered.com',
    sort_order: 6,
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    website_url: 'https://xbox.com',
    sort_order: 7,
  },
  { name: 'JBL', slug: 'jbl', website_url: 'https://jbl.com', sort_order: 8 },
  {
    name: 'GoPro',
    slug: 'gopro',
    website_url: 'https://gopro.com',
    sort_order: 9,
  },
  {
    name: 'Canon',
    slug: 'canon',
    website_url: 'https://canon.com',
    sort_order: 10,
  },
]

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
interface ProductSeed {
  brand_slug: string
  name: string
  slug: string
  category_slug: string
  description: string
  key_features: string[]
  specs: Record<string, string>
  images?: string[]
}

const products: ProductSeed[] = [
  // Smartphones
  {
    brand_slug: 'apple',
    name: 'iPhone 16 Pro Max',
    slug: 'apple-iphone-16-pro-max',
    category_slug: 'smartphones',
    description:
      'Latest flagship with A18 Pro chip, 48MP camera system, and titanium design.',
    images: [`${STORAGE_BASE}/apple-iphone-16-pro-max.svg`],
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
    brand_slug: 'apple',
    name: 'iPhone 15 Pro',
    slug: 'apple-iphone-15-pro',
    category_slug: 'smartphones',
    description:
      'Pro-level performance with A17 Pro chip and advanced camera system.',
    images: [`${STORAGE_BASE}/apple-iphone-15-pro.svg`],
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
    brand_slug: 'apple',
    name: 'iPhone 14',
    slug: 'apple-iphone-14',
    category_slug: 'smartphones',
    description:
      'Reliable everyday iPhone with A15 Bionic and excellent camera.',
    images: [`${STORAGE_BASE}/apple-iphone-14.svg`],
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
    brand_slug: 'apple',
    name: 'iPhone 13',
    slug: 'apple-iphone-13',
    category_slug: 'smartphones',
    description:
      'Great value with A15 Bionic chip, dual cameras, and all-day battery.',
    images: [`${STORAGE_BASE}/apple-iphone-13.svg`],
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
    brand_slug: 'samsung',
    name: 'Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    category_slug: 'smartphones',
    description:
      'Samsung flagship with Galaxy AI, S Pen, and 200MP camera system.',
    images: [`${STORAGE_BASE}/samsung-galaxy-s24-ultra.svg`],
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
    brand_slug: 'samsung',
    name: 'Galaxy S23',
    slug: 'samsung-galaxy-s23',
    category_slug: 'smartphones',
    description:
      'Compact flagship with Snapdragon 8 Gen 2, 50MP camera, and all-day battery.',
    images: [`${STORAGE_BASE}/samsung-galaxy-s23.svg`],
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
    brand_slug: 'samsung',
    name: 'Galaxy S22',
    slug: 'samsung-galaxy-s22',
    category_slug: 'smartphones',
    description: 'Previous gen flagship at excellent value.',
    images: [`${STORAGE_BASE}/samsung-galaxy-s22.svg`],
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
    brand_slug: 'google',
    name: 'Pixel 8 Pro',
    slug: 'google-pixel-8-pro',
    category_slug: 'smartphones',
    description: 'Google AI-powered phone with best-in-class camera.',
    images: [`${STORAGE_BASE}/google-pixel-8-pro.svg`],
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
    brand_slug: 'google',
    name: 'Pixel 7a',
    slug: 'google-pixel-7a',
    category_slug: 'smartphones',
    description: 'Affordable Pixel experience with flagship camera features.',
    images: [`${STORAGE_BASE}/google-pixel-7a.svg`],
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
    brand_slug: 'apple',
    name: 'MacBook Air M2',
    slug: 'apple-macbook-air-m2',
    category_slug: 'laptops',
    description:
      'Ultra-thin and light laptop with M2 chip for all-day productivity.',
    images: [`${STORAGE_BASE}/apple-macbook-air-m2.svg`],
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
    brand_slug: 'apple',
    name: 'MacBook Pro 14" M3 Pro',
    slug: 'apple-macbook-pro-14-m3-pro',
    category_slug: 'laptops',
    description:
      'Professional-grade laptop with M3 Pro chip for demanding workflows.',
    images: [`${STORAGE_BASE}/apple-macbook-pro-14-m3-pro.svg`],
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
    brand_slug: 'lenovo',
    name: 'ThinkPad X1 Carbon Gen 11',
    slug: 'lenovo-thinkpad-x1-carbon-gen-11',
    category_slug: 'laptops',
    description:
      'Business ultrabook with Intel 13th Gen and legendary ThinkPad keyboard.',
    images: [`${STORAGE_BASE}/lenovo-thinkpad-x1-carbon-gen-11.svg`],
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
    brand_slug: 'apple',
    name: 'iPad Air M2',
    slug: 'apple-ipad-air-m2',
    category_slug: 'tablets',
    description:
      'Versatile tablet with M2 chip, Apple Pencil Pro support, and stunning display.',
    images: [`${STORAGE_BASE}/apple-ipad-air-m2.svg`],
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
    brand_slug: 'apple',
    name: 'iPad 10th Gen',
    slug: 'apple-ipad-10th-gen',
    category_slug: 'tablets',
    description:
      'Affordable iPad with A14 Bionic and modern all-screen design.',
    images: [`${STORAGE_BASE}/apple-ipad-10th-gen.svg`],
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
    brand_slug: 'samsung',
    name: 'Galaxy Tab S9',
    slug: 'samsung-galaxy-tab-s9',
    category_slug: 'tablets',
    description:
      'Premium Android tablet with S Pen and stunning AMOLED display.',
    images: [`${STORAGE_BASE}/samsung-galaxy-tab-s9.svg`],
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
    brand_slug: 'apple',
    name: 'Apple Watch Series 9',
    slug: 'apple-watch-series-9',
    category_slug: 'wearables',
    description:
      'Smartwatch with S9 SiP, Double Tap gesture, and health monitoring.',
    images: [`${STORAGE_BASE}/apple-watch-series-9.svg`],
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
    brand_slug: 'samsung',
    name: 'Galaxy Watch 6',
    slug: 'samsung-galaxy-watch-6',
    category_slug: 'wearables',
    description:
      'Wear OS smartwatch with BIA sensor and comprehensive health tracking.',
    images: [`${STORAGE_BASE}/samsung-galaxy-watch-6.svg`],
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
    brand_slug: 'apple',
    name: 'AirPods Pro 2',
    slug: 'apple-airpods-pro-2',
    category_slug: 'accessories',
    description:
      'Premium earbuds with adaptive noise cancellation and USB-C case.',
    images: [`${STORAGE_BASE}/apple-airpods-pro-2.svg`],
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
    brand_slug: 'samsung',
    name: 'Galaxy Buds3 Pro',
    slug: 'samsung-galaxy-buds3-pro',
    category_slug: 'accessories',
    description:
      'Premium earbuds with Galaxy AI-enhanced audio and blade design.',
    images: [`${STORAGE_BASE}/samsung-galaxy-buds3-pro.svg`],
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
  // Gaming
  {
    brand_slug: 'nintendo',
    name: 'Switch OLED',
    slug: 'nintendo-switch-oled',
    category_slug: 'gaming',
    description:
      'Hybrid gaming console with vibrant 7-inch OLED screen and versatile play modes.',
    key_features: [
      '7" OLED screen',
      'Tabletop/TV/Handheld modes',
      '64GB internal storage',
      'Enhanced audio',
      'Wide adjustable stand',
    ],
    specs: {
      display: '7" OLED 1280x720',
      storage: '64GB',
      battery: '4.5-9 hours',
      weight: '420g (with Joy-Cons)',
    },
  },
  {
    brand_slug: 'sony',
    name: 'PlayStation 5 Slim',
    slug: 'sony-playstation-5-slim',
    category_slug: 'gaming',
    description:
      'Compact PS5 with 1TB SSD, 4K gaming, and DualSense controller.',
    key_features: [
      'Custom AMD Zen 2 CPU',
      '4K/120fps gaming',
      '1TB SSD',
      'DualSense haptic feedback',
      'Ray tracing',
    ],
    specs: {
      cpu: 'AMD Zen 2, 8-core 3.5GHz',
      gpu: 'AMD RDNA 2, 10.28 TFLOPS',
      storage: '1TB NVMe SSD',
      output: '4K@120Hz, 8K',
    },
  },
  {
    brand_slug: 'valve',
    name: 'Steam Deck OLED',
    slug: 'valve-steam-deck-oled',
    category_slug: 'gaming',
    description:
      'Handheld PC gaming device with gorgeous HDR OLED display and full Steam library access.',
    key_features: [
      '7.4" HDR OLED',
      'AMD APU (Zen 2 + RDNA 2)',
      'Full Steam library',
      'SteamOS',
      'Hall-effect joysticks',
    ],
    specs: {
      display: '7.4" HDR OLED 1280x800',
      cpu: 'AMD Zen 2, 4-core',
      storage: '512GB / 1TB NVMe',
      battery: '3-12 hours',
    },
  },
  {
    brand_slug: 'microsoft',
    name: 'Xbox Series X',
    slug: 'microsoft-xbox-series-x',
    category_slug: 'gaming',
    description:
      'Most powerful Xbox with 4K gaming, Quick Resume, and Game Pass support.',
    key_features: [
      '12 TFLOPS GPU',
      '4K/120fps',
      '1TB SSD',
      'Quick Resume',
      'Xbox Game Pass',
    ],
    specs: {
      cpu: 'AMD Zen 2, 8-core 3.8GHz',
      gpu: 'AMD RDNA 2, 12 TFLOPS',
      storage: '1TB NVMe SSD',
      output: '4K@120Hz, 8K',
    },
  },
  // Audio
  {
    brand_slug: 'sony',
    name: 'WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    category_slug: 'audio',
    description:
      'Industry-leading noise cancellation headphones with exceptional sound quality.',
    key_features: [
      'Best-in-class ANC',
      '30hr battery',
      'Multipoint connection',
      'Speak-to-Chat',
      'LDAC Hi-Res',
    ],
    specs: {
      driver: '30mm',
      anc: 'Adaptive (8 mics)',
      battery: '30 hours',
      weight: '250g',
    },
  },
  {
    brand_slug: 'jbl',
    name: 'Flip 6',
    slug: 'jbl-flip-6',
    category_slug: 'audio',
    description:
      'Portable Bluetooth speaker with bold sound, IP67 waterproof rating, and 12-hour battery.',
    key_features: [
      'IP67 waterproof/dustproof',
      '12hr battery',
      'PartyBoost pairing',
      'JBL Pro Sound',
      'USB-C',
    ],
    specs: {
      driver: 'Racetrack-shaped',
      battery: '12 hours',
      waterproof: 'IP67',
      connectivity: 'Bluetooth 5.1',
    },
  },
  {
    brand_slug: 'apple',
    name: 'AirPods Max',
    slug: 'apple-airpods-max',
    category_slug: 'audio',
    description:
      'Premium over-ear headphones with Apple H1 chip, ANC, and Spatial Audio.',
    key_features: [
      'Apple H1 chip',
      'Active Noise Cancellation',
      'Spatial Audio',
      'Digital Crown',
      'Stainless steel/aluminum',
    ],
    specs: {
      driver: '40mm Apple-designed',
      anc: 'Active + Transparency',
      battery: '20 hours',
      weight: '384g',
    },
  },
  // Cameras
  {
    brand_slug: 'gopro',
    name: 'HERO12 Black',
    slug: 'gopro-hero12-black',
    category_slug: 'cameras',
    description:
      'Ultimate action camera with 5.3K video, HyperSmooth 6.0, and 10-bit color.',
    key_features: [
      '5.3K60 video',
      'HyperSmooth 6.0',
      '27MP photos',
      '10-bit color',
      'Waterproof 33ft',
    ],
    specs: {
      video: '5.3K60 / 4K120',
      photo: '27MP',
      stabilization: 'HyperSmooth 6.0',
      waterproof: '10m without housing',
    },
  },
  {
    brand_slug: 'canon',
    name: 'EOS R50',
    slug: 'canon-eos-r50',
    category_slug: 'cameras',
    description:
      'Compact mirrorless camera ideal for content creators with 4K video and eye-tracking AF.',
    key_features: [
      '24.2MP APS-C sensor',
      '4K 30fps video',
      'Dual Pixel CMOS AF II',
      'Eye-tracking AF',
      'Compact & lightweight',
    ],
    specs: {
      sensor: '24.2MP APS-C CMOS',
      video: '4K 30fps, FHD 120fps',
      af: 'Dual Pixel CMOS AF II, 651 points',
      weight: '375g (body only)',
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
  cost_kes?: number
  sale_price_kes?: number
  source: string
  listing_type?: 'standard' | 'affiliate'
  ram?: string
  source_url?: string
  notes?: string[]
  includes?: string[]
  warranty_months?: number
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
    cost_kes: 164301,
    sale_price_kes: 169000,
    source: 'swappa',
  },
  {
    product_slug: 'apple-iphone-16-pro-max',
    storage: '512GB',
    color: 'Black Titanium',
    condition: 'premium',
    battery_health: 100,
    price_kes: 225000,
    cost_kes: 194201,
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
    cost_kes: 134401,
    sale_price_kes: 115000,
    source: 'swappa',
  },
  {
    product_slug: 'apple-iphone-15-pro',
    storage: '128GB',
    color: 'Natural Titanium',
    condition: 'excellent',
    battery_health: 94,
    price_kes: 145000,
    cost_kes: 119451,
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
    cost_kes: 89551,
    sale_price_kes: 74000,
    source: 'backmarket',
  },
  {
    product_slug: 'apple-iphone-14',
    storage: '256GB',
    color: 'Starlight',
    condition: 'acceptable',
    battery_health: 82,
    price_kes: 75000,
    cost_kes: 104501,
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
    cost_kes: 64136,
    sale_price_kes: 52000,
    source: 'backmarket',
  },
  {
    product_slug: 'apple-iphone-13',
    storage: '256GB',
    color: 'Blue',
    condition: 'excellent',
    battery_health: 92,
    price_kes: 68000,
    cost_kes: 79086,
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
    cost_kes: 164301,
    sale_price_kes: 149000,
    source: 'swappa',
  },
  {
    product_slug: 'samsung-galaxy-s24-ultra',
    storage: '512GB',
    color: 'Titanium Violet',
    condition: 'premium',
    battery_health: 100,
    price_kes: 198000,
    cost_kes: 194201,
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
    cost_kes: 89551,
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
    cost_kes: 59651,
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
    cost_kes: 111976,
    source: 'swappa',
  },
  {
    product_slug: 'google-pixel-8-pro',
    storage: '256GB',
    color: 'Bay',
    condition: 'good',
    battery_health: 90,
    price_kes: 98000,
    cost_kes: 126926,
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
    cost_kes: 52176,
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
    cost_kes: 134401,
    source: 'backmarket',
    ram: '8GB',
  },
  {
    product_slug: 'apple-macbook-air-m2',
    storage: '512GB',
    color: 'Starlight',
    condition: 'good',
    battery_health: 88,
    price_kes: 138000,
    cost_kes: 164301,
    source: 'swappa',
    ram: '8GB',
  },
  // MacBook Pro 14" M3 Pro
  {
    product_slug: 'apple-macbook-pro-14-m3-pro',
    storage: '512GB',
    color: 'Space Black',
    condition: 'premium',
    battery_health: 99,
    price_kes: 275000,
    cost_kes: 268951,
    source: 'backmarket',
    ram: '18GB',
  },
  // ThinkPad X1 Carbon
  {
    product_slug: 'lenovo-thinkpad-x1-carbon-gen-11',
    storage: '512GB',
    color: 'Black',
    condition: 'good',
    battery_health: 87,
    price_kes: 165000,
    cost_kes: 209151,
    source: 'backmarket',
    ram: '16GB',
  },
  // iPad Air M2
  {
    product_slug: 'apple-ipad-air-m2',
    storage: '128GB',
    color: 'Space Gray',
    condition: 'excellent',
    battery_health: 95,
    price_kes: 78000,
    cost_kes: 89551,
    source: 'swappa',
  },
  {
    product_slug: 'apple-ipad-air-m2',
    storage: '256GB',
    color: 'Starlight',
    condition: 'good',
    battery_health: 90,
    price_kes: 85000,
    cost_kes: 104501,
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
    cost_kes: 52176,
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
    cost_kes: 97026,
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
    cost_kes: 49186,
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
    cost_kes: 37226,
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
    cost_kes: 29751,
    source: 'backmarket',
  },
  {
    product_slug: 'apple-airpods-pro-2',
    storage: 'N/A',
    color: 'White',
    condition: 'good',
    battery_health: 90,
    price_kes: 22000,
    cost_kes: 29751,
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
    cost_kes: 26761,
    source: 'backmarket',
  },
  // Samsung Galaxy S24 Ultra - Affiliate listing
  {
    product_slug: 'samsung-galaxy-s24-ultra',
    storage: '256GB',
    color: 'Titanium Gray',
    condition: 'premium',
    battery_health: 100,
    price_kes: 185000,
    cost_kes: 179251,
    source: 'samsung.com',
    source_url: 'https://samsung.com/galaxy-s24-ultra',
    listing_type: 'affiliate',
  },
  // Nintendo Switch OLED
  {
    product_slug: 'nintendo-switch-oled',
    storage: '64GB',
    color: 'White',
    condition: 'excellent',
    battery_health: 95,
    price_kes: 38000,
    cost_kes: 44701,
    sale_price_kes: 33000,
    source: 'swappa',
  },
  {
    product_slug: 'nintendo-switch-oled',
    storage: '64GB',
    color: 'Neon Red/Blue',
    condition: 'good',
    battery_health: 88,
    price_kes: 32000,
    cost_kes: 44701,
    source: 'backmarket',
  },
  // PlayStation 5 Slim
  {
    product_slug: 'sony-playstation-5-slim',
    storage: '1TB',
    color: 'White',
    condition: 'excellent',
    battery_health: 100,
    price_kes: 62000,
    cost_kes: 67126,
    sale_price_kes: 55000,
    source: 'backmarket',
  },
  {
    product_slug: 'sony-playstation-5-slim',
    storage: '1TB',
    color: 'Black',
    condition: 'good',
    battery_health: 100,
    price_kes: 58000,
    cost_kes: 67126,
    source: 'swappa',
  },
  // Steam Deck OLED
  {
    product_slug: 'valve-steam-deck-oled',
    storage: '512GB',
    color: 'Black',
    condition: 'excellent',
    battery_health: 96,
    price_kes: 55000,
    cost_kes: 67126,
    source: 'swappa',
  },
  {
    product_slug: 'valve-steam-deck-oled',
    storage: '1TB',
    color: 'Black',
    condition: 'premium',
    battery_health: 100,
    price_kes: 72000,
    cost_kes: 82076,
    sale_price_kes: 65000,
    source: 'backmarket',
  },
  // Xbox Series X
  {
    product_slug: 'microsoft-xbox-series-x',
    storage: '1TB',
    color: 'Black',
    condition: 'excellent',
    battery_health: 100,
    price_kes: 58000,
    cost_kes: 67126,
    source: 'backmarket',
  },
  // Sony WH-1000XM5
  {
    product_slug: 'sony-wh-1000xm5',
    storage: 'N/A',
    color: 'Black',
    condition: 'excellent',
    battery_health: 98,
    price_kes: 38000,
    cost_kes: 44701,
    sale_price_kes: 32000,
    source: 'swappa',
  },
  {
    product_slug: 'sony-wh-1000xm5',
    storage: 'N/A',
    color: 'Silver',
    condition: 'good',
    battery_health: 92,
    price_kes: 34000,
    cost_kes: 44701,
    source: 'backmarket',
  },
  // JBL Flip 6
  {
    product_slug: 'jbl-flip-6',
    storage: 'N/A',
    color: 'Blue',
    condition: 'excellent',
    battery_health: 97,
    price_kes: 12000,
    cost_kes: 14801,
    source: 'swappa',
  },
  {
    product_slug: 'jbl-flip-6',
    storage: 'N/A',
    color: 'Black',
    condition: 'good',
    battery_health: 90,
    price_kes: 10000,
    cost_kes: 14801,
    sale_price_kes: 8500,
    source: 'backmarket',
  },
  // AirPods Max
  {
    product_slug: 'apple-airpods-max',
    storage: 'N/A',
    color: 'Space Gray',
    condition: 'excellent',
    battery_health: 95,
    price_kes: 62000,
    cost_kes: 67126,
    source: 'backmarket',
  },
  {
    product_slug: 'apple-airpods-max',
    storage: 'N/A',
    color: 'Silver',
    condition: 'good',
    battery_health: 88,
    price_kes: 55000,
    cost_kes: 67126,
    sale_price_kes: 48000,
    source: 'swappa',
  },
  // GoPro HERO12 Black
  {
    product_slug: 'gopro-hero12-black',
    storage: 'N/A',
    color: 'Black',
    condition: 'excellent',
    battery_health: 96,
    price_kes: 45000,
    cost_kes: 52176,
    source: 'swappa',
  },
  {
    product_slug: 'gopro-hero12-black',
    storage: 'N/A',
    color: 'Black',
    condition: 'good',
    battery_health: 90,
    price_kes: 40000,
    cost_kes: 52176,
    sale_price_kes: 35000,
    source: 'backmarket',
  },
  // Canon EOS R50
  {
    product_slug: 'canon-eos-r50',
    storage: 'N/A',
    color: 'Black',
    condition: 'excellent',
    battery_health: 98,
    price_kes: 82000,
    cost_kes: 89551,
    source: 'backmarket',
  },
]

// ---------------------------------------------------------------------------
// Seed execution
// ---------------------------------------------------------------------------
async function seed() {
  console.log('Starting seed...\n')

  // 1. Insert brands
  console.log('Inserting brands...')
  const brandRows = brands.map(b => ({
    name: b.name,
    slug: b.slug,
    logo_url: b.logo_url ?? null,
    website_url: b.website_url ?? null,
    sort_order: b.sort_order,
  }))

  const { data: brandData, error: brandError } = await supabase
    .from('brands')
    .upsert(brandRows, { onConflict: 'slug' })
    .select('id, slug')

  if (brandError) {
    console.error('Brands error:', brandError.message)
    process.exit(1)
  }

  const brandMap = new Map(brandData.map(b => [b.slug, b.id]))
  console.log(`  ${brandMap.size} brands inserted`)

  // 2. Insert categories (two passes: roots first, then children)
  console.log('Inserting categories...')

  const rootCategories = categories.filter(c => !c.parent_slug)
  const rootRows = rootCategories.map(c => ({
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    icon: c.icon ?? null,
    sort_order: c.sort_order,
    image_url: c.image_url ?? null,
    parent_id: null,
  }))

  const { data: rootData, error: rootError } = await supabase
    .from('categories')
    .upsert(rootRows, { onConflict: 'slug' })
    .select('id, slug')

  if (rootError) {
    console.error('Root categories error:', rootError.message)
    process.exit(1)
  }

  const categoryMap = new Map(rootData.map(c => [c.slug, c.id]))

  let remaining = categories.filter(c => c.parent_slug)
  let insertedInPass = true

  while (remaining.length > 0 && insertedInPass) {
    insertedInPass = false
    const canInsert = remaining.filter(c => categoryMap.has(c.parent_slug!))
    const cannotInsert = remaining.filter(c => !categoryMap.has(c.parent_slug!))

    if (canInsert.length > 0) {
      const childRows = canInsert.map(c => ({
        name: c.name,
        slug: c.slug,
        description: c.description ?? null,
        icon: c.icon ?? null,
        sort_order: c.sort_order,
        image_url: c.image_url ?? null,
        parent_id: categoryMap.get(c.parent_slug!) ?? null,
      }))

      const { data: childData, error: childError } = await supabase
        .from('categories')
        .upsert(childRows, { onConflict: 'slug' })
        .select('id, slug')

      if (childError) {
        console.error('Child categories error:', childError.message)
        process.exit(1)
      }

      for (const c of childData) {
        categoryMap.set(c.slug, c.id)
      }
      insertedInPass = true
    }

    remaining = cannotInsert
  }

  if (remaining.length > 0) {
    console.error(
      'Could not resolve parent for categories:',
      remaining.map(c => c.slug)
    )
    process.exit(1)
  }

  console.log(`  ${categoryMap.size} categories inserted`)

  // 3. Insert products
  console.log('Inserting products...')
  const productRows = products.map(p => {
    const brandId = brandMap.get(p.brand_slug)
    if (!brandId) {
      throw new Error(`Brand not found for slug: ${p.brand_slug}`)
    }
    return {
      brand_id: brandId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      key_features: p.key_features,
      specs: p.specs,
      images: p.images ?? [],
    }
  })

  const { data: prodData, error: prodError } = await supabase
    .from('products')
    .upsert(productRows, { onConflict: 'slug' })
    .select('id, slug')

  if (prodError) {
    console.error('Products error:', prodError.message)
    process.exit(1)
  }
  console.log(`  ${prodData.length} products inserted`)

  const productMap = new Map(prodData.map(p => [p.slug, p.id]))

  // 4. Insert product_categories
  console.log('Inserting product categories...')
  const productCategoryRows = products
    .map(p => {
      const productId = productMap.get(p.slug)
      const categoryId = categoryMap.get(p.category_slug)
      if (!productId || !categoryId) return null
      return {
        product_id: productId,
        category_id: categoryId,
        is_primary: true,
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  const { error: pcError } = await supabase
    .from('product_categories')
    .upsert(productCategoryRows, { onConflict: 'product_id,category_id' })

  if (pcError) {
    console.error('Product categories error:', pcError.message)
    process.exit(1)
  }
  console.log(`  ${productCategoryRows.length} product categories inserted`)

  // 5. Insert listings (clear existing first for idempotency)
  console.log('Inserting listings...')
  await supabase
    .from('listings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('sku_sequences').delete().neq('prefix', '')
  const listingRows = listings.map(l => {
    const productId = productMap.get(l.product_slug)
    if (!productId) {
      throw new Error(`Product not found for slug: ${l.product_slug}`)
    }
    return {
      product_id: productId,
      storage: l.storage,
      color: l.color,
      condition: l.condition,
      battery_health: l.battery_health,
      price_kes: l.price_kes,
      sale_price_kes: l.sale_price_kes ?? null,
      cost_kes: l.cost_kes ?? null,
      listing_type: l.listing_type ?? 'standard',
      source: l.source,
      source_url: l.source_url ?? null,
      ram: l.ram ?? null,
      status: 'active' as const,
      is_featured: l.condition === 'premium' || l.condition === 'excellent',
      notes: l.notes ?? [],
      includes: l.includes ?? [],
      warranty_months: l.warranty_months ?? null,
    }
  })

  const { data: listData, error: listError } = await supabase
    .from('listings')
    .insert(listingRows)
    .select('id')

  if (listError) {
    console.error('Listings error:', listError.message)
    process.exit(1)
  }
  console.log(`  ${listData.length} listings inserted`)

  // 6. Insert newsletter subscriber
  console.log('Inserting sample newsletter subscriber...')
  const { error: newsError } = await supabase
    .from('newsletter_subscribers')
    .upsert([{ email: 'demo@pedie.tech' }], { onConflict: 'email' })

  if (newsError) {
    console.error('Newsletter error:', newsError.message)
  } else {
    console.log('  1 newsletter subscriber inserted')
  }

  console.log('\nSeed complete!')
  console.log(`  Brands:              ${brandMap.size}`)
  console.log(`  Categories:          ${categoryMap.size}`)
  console.log(`  Products:            ${prodData.length}`)
  console.log(`  Product categories:  ${productCategoryRows.length}`)
  console.log(`  Listings:            ${listData.length}`)
}

seed().catch(err => {
  console.error('Fatal seed error:', err)
  process.exit(1)
})

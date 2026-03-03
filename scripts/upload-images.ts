/**
 * Downloads product images from the web and uploads them to Supabase storage.
 * Usage: bun scripts/upload-images.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BUCKET = 'product-images'

// Product slug → display name + brand color mapping
const productInfo: Record<string, { name: string; brand: string }> = {
  // Smartphones
  'apple-iphone-16-pro-max': { name: 'iPhone 16 Pro Max', brand: 'Apple' },
  'apple-iphone-15-pro': { name: 'iPhone 15 Pro', brand: 'Apple' },
  'apple-iphone-14': { name: 'iPhone 14', brand: 'Apple' },
  'apple-iphone-13': { name: 'iPhone 13', brand: 'Apple' },
  'samsung-galaxy-s24-ultra': { name: 'Galaxy S24 Ultra', brand: 'Samsung' },
  'samsung-galaxy-s23': { name: 'Galaxy S23', brand: 'Samsung' },
  'samsung-galaxy-s22': { name: 'Galaxy S22', brand: 'Samsung' },
  'google-pixel-8-pro': { name: 'Pixel 8 Pro', brand: 'Google' },
  'google-pixel-7a': { name: 'Pixel 7a', brand: 'Google' },
  // Laptops
  'apple-macbook-air-m2': { name: 'MacBook Air M2', brand: 'Apple' },
  'apple-macbook-pro-14-m3-pro': {
    name: 'MacBook Pro 14" M3',
    brand: 'Apple',
  },
  'lenovo-thinkpad-x1-carbon-gen-11': {
    name: 'ThinkPad X1 Carbon',
    brand: 'Lenovo',
  },
  // Tablets
  'apple-ipad-air-m2': { name: 'iPad Air M2', brand: 'Apple' },
  'apple-ipad-10th-gen': { name: 'iPad 10th Gen', brand: 'Apple' },
  'samsung-galaxy-tab-s9': { name: 'Galaxy Tab S9', brand: 'Samsung' },
  // Wearables
  'apple-watch-series-9': { name: 'Watch Series 9', brand: 'Apple' },
  'samsung-galaxy-watch-6': { name: 'Galaxy Watch 6', brand: 'Samsung' },
  // Accessories
  'apple-airpods-pro-2': { name: 'AirPods Pro 2', brand: 'Apple' },
  'samsung-galaxy-buds3-pro': { name: 'Galaxy Buds3 Pro', brand: 'Samsung' },
}

const brandColors: Record<string, { bg: string; fg: string; accent: string }> =
  {
    Apple: { bg: '1d1d1f', fg: 'f5f5f7', accent: '0071e3' },
    Samsung: { bg: '1428a0', fg: 'ffffff', accent: '00a9e0' },
    Google: { bg: '202124', fg: 'e8eaed', accent: '4285f4' },
    Lenovo: { bg: 'e1251b', fg: 'ffffff', accent: 'ffffff' },
  }

function buildSvg(name: string, brand: string): string {
  const colors = brandColors[brand] || brandColors.Apple
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#${colors.bg}"/>
  <rect x="50" y="150" width="500" height="300" rx="24" fill="#${colors.bg}" stroke="#${colors.accent}" stroke-width="2" opacity="0.6"/>
  <text x="300" y="280" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="18" fill="#${colors.accent}" font-weight="600" letter-spacing="3">${brand.toUpperCase()}</text>
  <text x="300" y="320" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="28" fill="#${colors.fg}" font-weight="700">${name}</text>
  <text x="300" y="380" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="14" fill="#${colors.fg}" opacity="0.5">Product Image</text>
</svg>`
}

// Build the image map from product info
const imageMap: Record<string, { svg: string }> = {}
for (const [slug, info] of Object.entries(productInfo)) {
  imageMap[slug] = { svg: buildSvg(info.name, info.brand) }
}

async function uploadImage(slug: string, svg: string) {
  const fileName = `${slug}.svg`

  // Check if file already exists
  const { data: existing } = await supabase.storage
    .from(BUCKET)
    .list('', { search: fileName })

  if (existing && existing.some(f => f.name === fileName)) {
    console.log(`   ⏭️  ${fileName} already exists, skipping`)
    return true
  }

  try {
    // Upload SVG as the product image (will be served and work with Next.js Image)
    const svgBuffer = new TextEncoder().encode(svg)

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, svgBuffer, {
        contentType: 'image/svg+xml',
        upsert: true,
      })

    if (error) {
      console.error(`   ❌ Upload failed for ${slug}: ${error.message}`)
      return false
    }

    console.log(
      `   ✅ ${fileName} (${Math.round(svgBuffer.byteLength / 1024)}KB)`
    )
    return true
  } catch (err) {
    console.error(
      `   ❌ Error processing ${slug}: ${err instanceof Error ? err.message : String(err)}`
    )
    return false
  }
}

async function main() {
  console.log('🖼️  Uploading product images to Supabase storage...\n')

  let success = 0
  let failed = 0

  for (const [slug, { svg }] of Object.entries(imageMap)) {
    const ok = await uploadImage(slug, svg)
    if (ok) success++
    else failed++
  }

  console.log(`\n📊 Results: ${success} uploaded, ${failed} failed`)

  // Verify uploads
  const { data: files } = await supabase.storage.from(BUCKET).list()
  console.log(`📁 Bucket contents: ${files?.length ?? 0} files in ${BUCKET}`)

  if (files) {
    for (const f of files) {
      const sizeKB = f.metadata?.size
        ? Math.round(Number(f.metadata.size) / 1024)
        : '?'
      console.log(`   - ${f.name} (${sizeKB}KB)`)
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})

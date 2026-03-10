import type { Database } from '@app-types/database'
import { parseSheetRow } from '@lib/sheets/parser'
import { createAdminClient } from '@lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { google, type sheets_v4 } from 'googleapis'
import { SHEETS_TAB } from '@/config'

export type { SheetRow } from '@lib/sheets/parser'
export { parseSheetRow } from '@lib/sheets/parser'

export type SyncSource = 'admin' | 'sheets' | 'system'

export interface SyncReport {
  created: number
  updated: number
  deleted: number
  errors: number
  details: string[]
}

export interface ExportOptions {
  /** 'additive' (default) only appends rows missing from the sheet.
   *  'full' overwrites the entire sheet (use for initial seed). */
  mode?: 'additive' | 'full'
  source?: SyncSource
}

export interface ExportReport {
  rows: number
  skipped: number
  errors: number
  details: string[]
  tabs?: Record<string, { rows: number; errors: number }>
}

export function getGoogleSheetsClient(): sheets_v4.Sheets {
  const credentialsBase64 = process.env.GCP_SERVICE_ACC
  if (!credentialsBase64) {
    throw new Error('Missing GCP_SERVICE_ACC env var')
  }

  let credentials: Record<string, unknown>
  try {
    credentials = JSON.parse(
      Buffer.from(credentialsBase64, 'base64').toString('utf-8')
    )
  } catch {
    throw new Error('Invalid GCP_SERVICE_ACC: malformed JSON')
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth })
}

export async function fetchSheetData(
  sheetsClient: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string
): Promise<string[][]> {
  const response = await sheetsClient.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  })

  return (response.data.values as string[][]) || []
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function findOrCreateProduct(
  supabase: SupabaseClient<Database>,
  brandName: string,
  model: string,
  categorySlug: string
): Promise<string> {
  // Look up or create brand
  const brandSlug = toSlug(brandName)
  const { data: existingBrand } = await supabase
    .from('brands')
    .select('id')
    .eq('slug', brandSlug)
    .limit(1)
    .maybeSingle()

  let brandId: string
  if (existingBrand) {
    brandId = existingBrand.id
  } else {
    const { data: newBrand, error: brandError } = await supabase
      .from('brands')
      .insert({ name: brandName, slug: brandSlug })
      .select('id')
      .single()

    if (brandError || !newBrand) {
      throw new Error(`Failed to create brand: ${brandError?.message}`)
    }
    brandId = newBrand.id
  }

  // Find existing product by brand_id + name (UNIQUE constraint)
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('brand_id', brandId)
    .eq('name', model)
    .limit(1)
    .maybeSingle()

  if (existing) {
    // Ensure product_categories junction row exists for existing products
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .limit(1)
      .maybeSingle()

    if (catData) {
      // Check if product already has a primary category
      const { data: existingPrimary } = await supabase
        .from('product_categories')
        .select('category_id')
        .eq('product_id', existing.id)
        .eq('is_primary', true)
        .limit(1)
        .maybeSingle()

      const shouldBePrimary =
        !existingPrimary || existingPrimary.category_id === catData.id

      const { error: junctionError } = await supabase
        .from('product_categories')
        .upsert(
          {
            product_id: existing.id,
            category_id: catData.id,
            is_primary: shouldBePrimary,
          },
          { onConflict: 'product_id,category_id' }
        )

      if (junctionError) {
        throw new Error(
          `Failed to ensure product_categories for product ${existing.id}: ${junctionError.message}`
        )
      }
    }

    return existing.id
  }

  // Look up the category by slug
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .limit(1)
    .maybeSingle()

  let categoryId: string

  if (category) {
    categoryId = category.id
  } else {
    // Find or default to Electronics root as parent
    const { data: electronicsRoot } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'electronics')
      .limit(1)
      .maybeSingle()

    if (!electronicsRoot?.id) {
      throw new Error(
        `Cannot create category "${categorySlug}": Electronics root category not found. ` +
          `Aborting insert to avoid creating a top-level orphan.`
      )
    }

    const categoryName = categorySlug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())

    const { data: newCategory, error: catError } = await supabase
      .from('categories')
      .insert({
        name: categoryName,
        slug: categorySlug,
        parent_id: electronicsRoot.id,
      })
      .select('id')
      .single()

    if (catError || !newCategory) {
      throw new Error(`Failed to find or create category: ${catError?.message}`)
    }
    categoryId = newCategory.id
  }

  // Generate slug from brand + model
  const slug = toSlug(`${brandName}-${model}`)

  // Insert product
  const { data: newProduct, error: prodError } = await supabase
    .from('products')
    .upsert(
      {
        brand_id: brandId,
        name: model,
        slug,
      },
      { onConflict: 'brand_id,name' }
    )
    .select('id')
    .single()

  if (prodError || !newProduct) {
    throw new Error(`Failed to create product: ${prodError?.message}`)
  }

  // Link product to category via product_categories junction table
  const { error: junctionError } = await supabase
    .from('product_categories')
    .upsert(
      {
        product_id: newProduct.id,
        category_id: categoryId,
        is_primary: true,
      },
      { onConflict: 'product_id,category_id' }
    )

  if (junctionError) {
    throw new Error(
      `Failed to link product ${newProduct.id} to category ${categoryId}: ${junctionError.message}`
    )
  }

  return newProduct.id
}

async function syncBrandsFromSheet(
  sheetsClient: sheets_v4.Sheets,
  spreadsheetId: string,
  supabase: SupabaseClient<Database>
): Promise<{ created: number; updated: number; errors: number }> {
  try {
    const rows = await fetchSheetData(
      sheetsClient,
      spreadsheetId,
      SHEETS_TAB.brands
    )
    if (rows.length < 2) return { created: 0, updated: 0, errors: 0 }

    const headers = rows[0].map(h => h.toLowerCase().trim())
    let created = 0
    let updated = 0
    let errors = 0

    for (let i = 1; i < rows.length; i++) {
      const data: Record<string, string> = {}
      headers.forEach((h, idx) => {
        data[h] = rows[i][idx]?.trim() || ''
      })

      if (!data.name || !data.slug) {
        errors++
        continue
      }

      const { data: existing } = await supabase
        .from('brands')
        .select('id')
        .eq('slug', data.slug)
        .limit(1)
        .maybeSingle()

      const brandPayload = {
        name: data.name,
        slug: data.slug,
        logo_url: data.logo_url || null,
        website_url: data.website_url || null,
        is_active: data.is_active !== 'false',
        sort_order: data.sort_order ? parseInt(data.sort_order, 10) || 0 : 0,
      }

      if (existing) {
        const { error } = await supabase
          .from('brands')
          .update(brandPayload)
          .eq('id', existing.id)
        if (error) errors++
        else updated++
      } else {
        const { error } = await supabase.from('brands').insert(brandPayload)
        if (error) errors++
        else created++
      }
    }

    return { created, updated, errors }
  } catch {
    return { created: 0, updated: 0, errors: 0 }
  }
}

async function syncCategoriesFromSheet(
  sheetsClient: sheets_v4.Sheets,
  spreadsheetId: string,
  supabase: SupabaseClient<Database>
): Promise<{ created: number; updated: number; errors: number }> {
  try {
    const rows = await fetchSheetData(
      sheetsClient,
      spreadsheetId,
      SHEETS_TAB.categories
    )
    if (rows.length < 2) return { created: 0, updated: 0, errors: 0 }

    const headers = rows[0].map(h => h.toLowerCase().trim())
    let created = 0
    let updated = 0
    let errors = 0

    for (let i = 1; i < rows.length; i++) {
      const data: Record<string, string> = {}
      headers.forEach((h, idx) => {
        data[h] = rows[i][idx]?.trim() || ''
      })

      if (!data.name || !data.slug) {
        errors++
        continue
      }

      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', data.slug)
        .limit(1)
        .maybeSingle()

      const categoryPayload = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image_url: data.image_url || null,
        icon: data.icon || null,
        parent_id: data.parent_id || null,
        is_active: data.is_active !== 'false',
        sort_order: data.sort_order ? parseInt(data.sort_order, 10) || 0 : 0,
      }

      if (existing) {
        const { error } = await supabase
          .from('categories')
          .update(categoryPayload)
          .eq('id', existing.id)
        if (error) errors++
        else updated++
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryPayload)
        if (error) errors++
        else created++
      }
    }

    return { created, updated, errors }
  } catch {
    return { created: 0, updated: 0, errors: 0 }
  }
}

async function syncPromotionsFromSheet(
  sheetsClient: sheets_v4.Sheets,
  spreadsheetId: string,
  supabase: SupabaseClient<Database>
): Promise<{ created: number; updated: number; errors: number }> {
  try {
    const rows = await fetchSheetData(
      sheetsClient,
      spreadsheetId,
      SHEETS_TAB.promotions
    )
    if (rows.length < 2) return { created: 0, updated: 0, errors: 0 }

    const headers = rows[0].map(h => h.toLowerCase().trim())
    let created = 0
    let updated = 0
    let errors = 0

    for (let i = 1; i < rows.length; i++) {
      const data: Record<string, string> = {}
      headers.forEach((h, idx) => {
        data[h] = rows[i][idx]?.trim() || ''
      })

      if (!data.name || !data.type) {
        errors++
        continue
      }

      // Upsert by name+type combo
      const { data: existing } = await supabase
        .from('promotions')
        .select('id')
        .eq('name', data.name)
        .eq('type', data.type as Database['public']['Enums']['promotion_type'])
        .limit(1)
        .maybeSingle()

      const promoPayload = {
        name: data.name,
        type: data.type as Database['public']['Enums']['promotion_type'],
        listing_id: data.listing_id || null,
        product_id: data.product_id || null,
        discount_pct: data.discount_pct
          ? parseFloat(data.discount_pct) || null
          : null,
        discount_amount_kes: data.discount_amount_kes
          ? parseInt(data.discount_amount_kes, 10) || null
          : null,
        starts_at: data.starts_at || new Date().toISOString(),
        ends_at:
          data.ends_at ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: data.is_active !== 'false',
        sort_order: data.sort_order ? parseInt(data.sort_order, 10) || 0 : 0,
      }

      if (existing) {
        const { error } = await supabase
          .from('promotions')
          .update(promoPayload)
          .eq('id', existing.id)
        if (error) errors++
        else updated++
      } else {
        const { error } = await supabase.from('promotions').insert(promoPayload)
        if (error) errors++
        else created++
      }
    }

    return { created, updated, errors }
  } catch {
    return { created: 0, updated: 0, errors: 0 }
  }
}

export async function syncFromSheets(
  source: SyncSource = 'sheets'
): Promise<SyncReport> {
  const report: SyncReport = {
    created: 0,
    updated: 0,
    deleted: 0,
    errors: 0,
    details: [],
  }

  const spreadsheetId = process.env.GS_SPREADSHEET_ID

  if (!spreadsheetId) {
    throw new Error('Missing GS_SPREADSHEET_ID env var')
  }

  const sheetsClient = getGoogleSheetsClient()
  const supabase = createAdminClient()

  // Sync reference tabs first (order matters: brands -> categories -> listings)
  const brandsImport = await syncBrandsFromSheet(
    sheetsClient,
    spreadsheetId,
    supabase
  )
  const categoriesImport = await syncCategoriesFromSheet(
    sheetsClient,
    spreadsheetId,
    supabase
  )
  const promotionsImport = await syncPromotionsFromSheet(
    sheetsClient,
    spreadsheetId,
    supabase
  )

  report.details.push(
    `Brands: ${brandsImport.created} created, ${brandsImport.updated} updated`
  )
  report.details.push(
    `Categories: ${categoriesImport.created} created, ${categoriesImport.updated} updated`
  )
  report.details.push(
    `Promotions: ${promotionsImport.created} created, ${promotionsImport.updated} updated`
  )

  const rows = await fetchSheetData(
    sheetsClient,
    spreadsheetId,
    SHEETS_TAB.listings
  )

  if (rows.length < 2) {
    report.details.push('No data rows found in sheet')
    return report
  }

  const headers = rows[0]

  for (let i = 1; i < rows.length; i++) {
    try {
      const parsed = parseSheetRow(rows[i], headers)
      if (!parsed) {
        report.details.push(`Row ${i + 1}: Skipped (missing required fields)`)
        continue
      }

      const productId = await findOrCreateProduct(
        supabase,
        parsed.brand,
        parsed.model,
        parsed.category.toLowerCase().replace(/\s+/g, '-')
      )

      const priceKes = parsed.price_kes ? parseInt(parsed.price_kes, 10) : 0

      if (priceKes === 0 || Number.isNaN(priceKes)) {
        report.details.push(`Row ${i + 1}: Skipped (invalid or missing price)`)
        report.errors++
        continue
      }

      const listingData = {
        product_id: productId,
        condition:
          parsed.condition_grade as Database['public']['Enums']['condition_grade'],
        price_kes: priceKes,
        sale_price_kes: parsed.sale_price_kes
          ? parseInt(parsed.sale_price_kes, 10) || null
          : null,
        images: parsed.images
          ? parsed.images
              .split(',')
              .map(url => url.trim())
              .filter(Boolean)
          : null,
        notes: parsed.notes ? [parsed.notes] : null,
        source: parsed.source || null,
        source_id: parsed.source_id || null,
        source_url: parsed.source_url || null,
        listing_type:
          (parsed.listing_type as
            | 'standard'
            | 'preorder'
            | 'affiliate'
            | 'referral') || 'standard',
        status:
          (parsed.status as Database['public']['Enums']['listing_status']) ||
          'active',
        ram: parsed.ram || null,
        warranty_months: parsed.warranty_months
          ? parseInt(parsed.warranty_months, 10) || null
          : null,
        includes: parsed.includes
          ? parsed.includes
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : null,
        admin_notes: parsed.admin_notes || null,
      }

      // Check if listing exists by source_id + source combo
      let existingListingId: string | null = null

      if (parsed.source_id && parsed.source) {
        const { data: existing } = await supabase
          .from('listings')
          .select('id')
          .eq('source_id', parsed.source_id)
          .eq('source', parsed.source)
          .limit(1)
          .maybeSingle()

        if (existing) existingListingId = existing.id
      }

      if (existingListingId) {
        // Update existing listing
        const { error } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', existingListingId)

        if (error) {
          report.errors++
          report.details.push(`Row ${i + 1}: Update failed - ${error.message}`)
        } else {
          report.updated++
          report.details.push(`Row ${i + 1}: Updated ${existingListingId}`)
          await supabase.from('sync_metadata').insert({
            listing_id: existingListingId,
            source,
            last_synced_at: new Date().toISOString(),
          })
        }
      } else {
        // Create new listing -- SKU is generated by the database
        const { data: inserted, error } = await supabase
          .from('listings')
          .insert(listingData)
          .select('id')
          .single()

        if (error) {
          report.errors++
          report.details.push(`Row ${i + 1}: Insert failed - ${error.message}`)
        } else {
          report.created++
          report.details.push(`Row ${i + 1}: Created new listing`)
          if (inserted) {
            await supabase.from('sync_metadata').insert({
              listing_id: inserted.id,
              source,
              last_synced_at: new Date().toISOString(),
            })
          }
        }
      }
    } catch (err) {
      report.errors++
      report.details.push(
        `Row ${i + 1}: Error - ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  // -- Deletion detection --
  // Collect source combos that were successfully synced from the sheet
  const syncedSourceKeys = new Set<string>()

  for (let i = 1; i < rows.length; i++) {
    const parsed = parseSheetRow(rows[i], headers)
    if (!parsed) continue

    if (parsed.source_id && parsed.source) {
      syncedSourceKeys.add(`${parsed.source}::${parsed.source_id}`)
    }
  }

  // Find DB listings with sources that weren't in the sheet
  {
    const { data: allSourced } = await supabase
      .from('listings')
      .select('id, source, source_id')
      .not('source', 'is', null)
      .not('source_id', 'is', null)

    if (allSourced) {
      for (const listing of allSourced) {
        const key = `${listing.source}::${listing.source_id}`
        if (!syncedSourceKeys.has(key)) {
          // Try hard-delete first; fall back to archived if FK prevents it
          const { error: deleteError } = await supabase
            .from('listings')
            .delete()
            .eq('id', listing.id)

          if (deleteError) {
            const { error: updateError } = await supabase
              .from('listings')
              .update({ status: 'archived' as never })
              .eq('id', listing.id)

            if (updateError) {
              report.errors++
              report.details.push(
                `Delete ${listing.id}: soft-delete failed - ${updateError.message}`
              )
            } else {
              report.deleted++
              report.details.push(
                `Delete ${listing.id}: soft-deleted (set archived)`
              )
            }
          } else {
            report.deleted++
            report.details.push(
              `Delete ${listing.id}: hard-deleted (removed from sheet)`
            )
          }
        }
      }
    }
  }

  return report
}

const SHEET_HEADERS = [
  'SKU',
  'Brand',
  'Model',
  'Category',
  'Condition Grade',
  'Price (KES)',
  'Sale Price (KES)',
  'RAM',
  'Warranty (Months)',
  'Notes',
  'Source',
  'Source ID',
  'Source URL',
  'Status',
  'Images',
  'Listing Type',
  'Includes',
  'Admin Notes',
]

async function syncBrandsToSheet(
  sheetsClient: sheets_v4.Sheets,
  spreadsheetId: string,
  supabase: SupabaseClient<Database>
): Promise<{ rows: number; errors: number }> {
  const { data: brands, error } = await supabase
    .from('brands')
    .select('name, slug, logo_url, website_url, is_active, sort_order')
    .order('sort_order')

  if (error || !brands) return { rows: 0, errors: 1 }

  const headers = [
    'name',
    'slug',
    'logo_url',
    'website_url',
    'is_active',
    'sort_order',
  ]
  const rows: string[][] = [
    headers,
    ...brands.map(b => [
      b.name,
      b.slug,
      b.logo_url || '',
      b.website_url || '',
      String(b.is_active),
      String(b.sort_order),
    ]),
  ]

  try {
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: SHEETS_TAB.brands,
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    })
  } catch (err) {
    console.error(
      `Failed to sync brands to sheet: ${err instanceof Error ? err.message : err}`
    )
    return { rows: 0, errors: 1 }
  }

  return { rows: brands.length, errors: 0 }
}

async function syncCategoriesToSheet(
  sheetsClient: sheets_v4.Sheets,
  spreadsheetId: string,
  supabase: SupabaseClient<Database>
): Promise<{ rows: number; errors: number }> {
  const { data: categories, error } = await supabase
    .from('categories')
    .select(
      'name, slug, description, image_url, icon, parent_id, is_active, sort_order'
    )
    .order('sort_order')

  if (error || !categories) return { rows: 0, errors: 1 }

  const headers = [
    'name',
    'slug',
    'description',
    'image_url',
    'icon',
    'parent_id',
    'is_active',
    'sort_order',
  ]
  const rows: string[][] = [
    headers,
    ...categories.map(c => [
      c.name,
      c.slug,
      c.description || '',
      c.image_url || '',
      c.icon || '',
      c.parent_id || '',
      String(c.is_active),
      String(c.sort_order),
    ]),
  ]

  try {
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: SHEETS_TAB.categories,
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    })
  } catch (err) {
    console.error(
      `Failed to sync categories to sheet: ${err instanceof Error ? err.message : err}`
    )
    return { rows: 0, errors: 1 }
  }

  return { rows: categories.length, errors: 0 }
}

async function syncPromotionsToSheet(
  sheetsClient: sheets_v4.Sheets,
  spreadsheetId: string,
  supabase: SupabaseClient<Database>
): Promise<{ rows: number; errors: number }> {
  const { data: promotions, error } = await supabase
    .from('promotions')
    .select(
      'name, type, listing_id, product_id, discount_pct, discount_amount_kes, starts_at, ends_at, is_active, sort_order'
    )
    .order('sort_order')

  if (error || !promotions) return { rows: 0, errors: 1 }

  const headers = [
    'name',
    'type',
    'listing_id',
    'product_id',
    'discount_pct',
    'discount_amount_kes',
    'starts_at',
    'ends_at',
    'is_active',
    'sort_order',
  ]
  const rows: string[][] = [
    headers,
    ...promotions.map(p => [
      p.name,
      p.type,
      p.listing_id || '',
      p.product_id || '',
      p.discount_pct?.toString() || '',
      p.discount_amount_kes?.toString() || '',
      p.starts_at,
      p.ends_at,
      String(p.is_active),
      String(p.sort_order),
    ]),
  ]

  try {
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: SHEETS_TAB.promotions,
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    })
  } catch (err) {
    console.error(
      `Failed to sync promotions to sheet: ${err instanceof Error ? err.message : err}`
    )
    return { rows: 0, errors: 1 }
  }

  return { rows: promotions.length, errors: 0 }
}

export async function syncToSheets(
  options: ExportOptions = {}
): Promise<ExportReport> {
  const mode = options.mode ?? 'additive'
  const report: ExportReport = {
    rows: 0,
    skipped: 0,
    errors: 0,
    details: [],
    tabs: {},
  }

  const spreadsheetId = process.env.GS_SPREADSHEET_ID
  if (!spreadsheetId) {
    throw new Error('Missing GS_SPREADSHEET_ID env var')
  }

  const supabase = createAdminClient()

  const { data: listings, error } = await supabase
    .from('listings')
    .select('*, products:product_id(name, slug, brand:brands(name, slug))')
    .order('created_at')

  if (error) {
    throw new Error(`Failed to fetch listings: ${error.message}`)
  }

  if (!listings || listings.length === 0) {
    report.details.push('No listings found in database')
  }

  type ListingRow = NonNullable<typeof listings>[number]

  const sheetsClient = getGoogleSheetsClient()

  // Skip listing export if no listings exist
  if (listings && listings.length > 0) {
    // In additive mode, read existing sheet to find which SKUs are already present
    const existingSkus = new Set<string>()
    if (mode === 'additive') {
      const existingRows = await fetchSheetData(
        sheetsClient,
        spreadsheetId,
        SHEETS_TAB.listings
      )
      if (existingRows.length > 1) {
        const headers = existingRows[0]
        const skuIndex = headers.findIndex(
          h => h.toLowerCase().trim() === 'sku'
        )
        if (skuIndex < 0) {
          report.errors++
          report.details.push(
            'Additive sync aborted: existing sheet has rows but no sku header -- refusing to overwrite'
          )
          return report
        }
        for (let i = 1; i < existingRows.length; i++) {
          const sku = existingRows[i][skuIndex]?.trim()
          if (sku) existingSkus.add(sku)
        }
      }
    }

    // Get categories for each product via junction table
    const productIds = [
      ...new Set(listings.map(l => l.product_id).filter(Boolean)),
    ]
    const { data: junctionData } = await supabase
      .from('product_categories')
      .select('product_id, category:categories(slug)')
      .in('product_id', productIds)
      .eq('is_primary', true)

    const productCategoryMap = new Map<string, string>()
    for (const row of (junctionData ?? []) as unknown as Array<{
      product_id: string
      category: { slug: string } | null
    }>) {
      if (row.category?.slug) {
        productCategoryMap.set(row.product_id, row.category.slug)
      }
    }

    /** Convert a listing row to a string array matching SHEET_HEADERS */
    function toRow(listing: ListingRow): string[] {
      const product = listing.products as unknown as {
        name: string
        slug: string
        brand: { name: string; slug: string } | null
      } | null

      return [
        listing.sku || '',
        product?.brand?.name || '',
        product?.name || '',
        productCategoryMap.get(listing.product_id) || '',
        (listing.condition as string) || '',
        listing.price_kes?.toString() || '',
        listing.sale_price_kes?.toString() || '',
        listing.ram || '',
        listing.warranty_months?.toString() || '',
        Array.isArray(listing.notes) ? listing.notes.join(', ') : '',
        listing.source || '',
        listing.source_id || '',
        listing.source_url || '',
        (listing.status as string) || '',
        Array.isArray(listing.images) ? listing.images.join(',') : '',
        (listing.listing_type as string) || 'standard',
        Array.isArray(listing.includes) ? listing.includes.join(',') : '',
        listing.admin_notes || '',
      ]
    }

    if (mode === 'full') {
      // Full overwrite -- replace entire sheet
      const sheetRows: string[][] = [SHEET_HEADERS]

      for (const listing of listings) {
        try {
          sheetRows.push(toRow(listing))
          report.rows++
        } catch (err) {
          report.errors++
          report.details.push(
            `Listing ${listing.sku}: Error - ${err instanceof Error ? err.message : String(err)}`
          )
        }
      }

      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: SHEETS_TAB.listings,
        valueInputOption: 'RAW',
        requestBody: { values: sheetRows },
      })

      report.details.push(`Full sync: wrote ${report.rows} rows to sheet`)
    } else {
      // Additive -- only append listings not already in the sheet
      const newRows: string[][] = []

      for (const listing of listings) {
        try {
          if (existingSkus.has(listing.sku)) {
            report.skipped++
            continue
          }
          newRows.push(toRow(listing))
          report.rows++
        } catch (err) {
          report.errors++
          report.details.push(
            `Listing ${listing.sku}: Error - ${err instanceof Error ? err.message : String(err)}`
          )
        }
      }

      if (newRows.length === 0) {
        report.details.push(
          `Additive sync: no new listings to append (${report.skipped} already in sheet)`
        )
      }

      if (newRows.length > 0) {
        // If sheet is empty, write headers first then data
        if (existingSkus.size === 0) {
          await sheetsClient.spreadsheets.values.update({
            spreadsheetId,
            range: SHEETS_TAB.listings,
            valueInputOption: 'RAW',
            requestBody: { values: [SHEET_HEADERS, ...newRows] },
          })
        } else {
          await sheetsClient.spreadsheets.values.append({
            spreadsheetId,
            range: SHEETS_TAB.listings,
            valueInputOption: 'RAW',
            requestBody: { values: newRows },
          })
        }
      }

      if (newRows.length > 0) {
        report.details.push(
          `Additive sync: appended ${report.rows} new rows (${report.skipped} already in sheet)`
        )
      }
    }
  } // end if (listings && listings.length > 0)

  // Sync additional tabs
  const brandsResult = await syncBrandsToSheet(
    sheetsClient,
    spreadsheetId,
    supabase
  )
  report.tabs!.brands = brandsResult

  const categoriesResult = await syncCategoriesToSheet(
    sheetsClient,
    spreadsheetId,
    supabase
  )
  report.tabs!.categories = categoriesResult

  const promotionsResult = await syncPromotionsToSheet(
    sheetsClient,
    spreadsheetId,
    supabase
  )
  report.tabs!.promotions = promotionsResult

  return report
}

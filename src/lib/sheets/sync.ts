import type { Database } from '@app-types/database'
import { generateListingId, usdToKes } from '@helpers'
import { parseSheetRow } from '@lib/sheets/parser'
import { createAdminClient } from '@lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { google, type sheets_v4 } from 'googleapis'
import { SHEETS_TAB_NAME } from '@/config'

export type { SheetRow } from '@lib/sheets/parser'
export { parseSheetRow } from '@lib/sheets/parser'

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
}

export interface ExportReport {
  rows: number
  skipped: number
  errors: number
  details: string[]
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

export async function findOrCreateProduct(
  supabase: SupabaseClient<Database>,
  brand: string,
  model: string,
  categorySlug: string
): Promise<string> {
  // Find existing product
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('brand', brand)
    .eq('model', model)
    .limit(1)
    .maybeSingle()

  if (existing) return existing.id

  // Find or create category — ignoreDuplicates avoids overwriting manually edited names
  const categoryName = categorySlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  const { data: category, error: catError } = await supabase
    .from('categories')
    .upsert(
      { name: categoryName, slug: categorySlug },
      { onConflict: 'slug', ignoreDuplicates: true }
    )
    .select('id')
    .single()

  if (catError || !category) {
    throw new Error(`Failed to find or create category: ${catError?.message}`)
  }
  const categoryId = category.id

  // Generate slug from brand + model
  const slug = `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Upsert product to handle race conditions on concurrent inserts
  const { data: newProduct, error: prodError } = await supabase
    .from('products')
    .upsert(
      {
        brand,
        model,
        slug,
        category_id: categoryId,
      },
      { onConflict: 'brand,model' }
    )
    .select('id')
    .single()

  if (prodError || !newProduct) {
    throw new Error(`Failed to create product: ${prodError?.message}`)
  }

  return newProduct.id
}

export async function syncFromSheets(): Promise<SyncReport> {
  const report: SyncReport = {
    created: 0,
    updated: 0,
    deleted: 0,
    errors: 0,
    details: [],
  }

  const spreadsheetId = process.env.GS_SPREADSHEET_ID
  const sheetName = SHEETS_TAB_NAME

  if (!spreadsheetId) {
    throw new Error('Missing GS_SPREADSHEET_ID env var')
  }

  const sheetsClient = getGoogleSheetsClient()
  const rows = await fetchSheetData(sheetsClient, spreadsheetId, sheetName)

  if (rows.length < 2) {
    report.details.push('No data rows found in sheet')
    return report
  }

  const headers = rows[0]
  const supabase = createAdminClient()

  for (let i = 1; i < rows.length; i++) {
    try {
      const parsed = parseSheetRow(rows[i], headers)
      if (!parsed) {
        report.details.push(`Row ${i + 1}: Skipped (missing required fields)`)
        continue
      }

      // Validate crawler source fields
      const crawlerSources = ['Swappa', 'Reebelo', 'BackMarket']
      if (parsed.source && crawlerSources.includes(parsed.source)) {
        if (!parsed.source_listing_id || !parsed.source_url) {
          const missing = [
            !parsed.source_listing_id && 'source_listing_id',
            !parsed.source_url && 'source_url',
          ]
            .filter(Boolean)
            .join(', ')
          report.errors++
          report.details.push(
            `Row ${i + 1}: Skipped (source=${parsed.source} requires ${missing})`
          )
          continue
        }
      }

      const productId = await findOrCreateProduct(
        supabase,
        parsed.brand,
        parsed.model,
        parsed.category.toLowerCase().replace(/\s+/g, '-')
      )

      const priceKes = parsed.price_kes
        ? parseInt(parsed.price_kes, 10)
        : parsed.price_usd
          ? usdToKes(parseFloat(parsed.price_usd))
          : 0

      if (priceKes === 0 || Number.isNaN(priceKes)) {
        report.details.push(`Row ${i + 1}: Skipped (invalid or missing price)`)
        report.errors++
        continue
      }

      // Update product-level original price if provided
      if (parsed.original_price_kes) {
        const parsedPrice = parseInt(parsed.original_price_kes, 10)
        if (!Number.isNaN(parsedPrice)) {
          const { error: priceError } = await supabase
            .from('products')
            .update({ original_price_kes: parsedPrice })
            .eq('id', productId)

          if (priceError) {
            report.details.push(
              `Row ${i + 1}: Failed to update product original_price_kes (${productId}) - ${priceError.message}`
            )
          }
        }
      }

      const listingData = {
        product_id: productId,
        condition:
          parsed.condition_grade as Database['public']['Enums']['condition_grade'],
        price_kes: priceKes,
        original_price_usd: parsed.price_usd
          ? parseFloat(parsed.price_usd)
          : null,
        images: parsed.images
          ? parsed.images
              .split(',')
              .map(url => url.trim())
              .filter(Boolean)
          : null,
        notes: parsed.notes || null,
        source: parsed.source || null,
        source_listing_id: parsed.source_listing_id || null,
        source_url: parsed.source_url || null,
        status:
          (parsed.status as Database['public']['Enums']['listing_status']) ||
          'available',
      }

      // Check if listing exists by source combo or listing_id
      let existingListingId: string | null = null

      if (parsed.source_listing_id && parsed.source) {
        const { data: existing } = await supabase
          .from('listings')
          .select('listing_id')
          .eq('source_listing_id', parsed.source_listing_id)
          .eq('source', parsed.source)
          .limit(1)
          .maybeSingle()

        if (existing) existingListingId = existing.listing_id
      }

      if (!existingListingId && parsed.listing_id) {
        const { data: existing } = await supabase
          .from('listings')
          .select('listing_id')
          .eq('listing_id', parsed.listing_id)
          .limit(1)
          .maybeSingle()

        if (existing) existingListingId = existing.listing_id
      }

      if (existingListingId) {
        // Update existing listing
        const { error } = await supabase
          .from('listings')
          .update(listingData)
          .eq('listing_id', existingListingId)

        if (error) {
          report.errors++
          report.details.push(`Row ${i + 1}: Update failed - ${error.message}`)
        } else {
          report.updated++
          report.details.push(`Row ${i + 1}: Updated ${existingListingId}`)
        }
      } else {
        // Create new listing
        const listingId = parsed.listing_id || generateListingId()
        const { error } = await supabase.from('listings').insert({
          ...listingData,
          listing_id: listingId,
        })

        if (error) {
          report.errors++
          report.details.push(`Row ${i + 1}: Insert failed - ${error.message}`)
        } else {
          report.created++
          report.details.push(`Row ${i + 1}: Created ${listingId}`)
        }
      }
    } catch (err) {
      report.errors++
      report.details.push(
        `Row ${i + 1}: Error - ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  // ── Deletion detection ──────────────────────────────────────────
  // Collect source combos that were successfully synced from the sheet
  const syncedSourceKeys = new Set<string>()
  const syncedListingIds = new Set<string>()

  for (let i = 1; i < rows.length; i++) {
    const parsed = parseSheetRow(rows[i], headers)
    if (!parsed) continue

    if (parsed.source_listing_id && parsed.source) {
      syncedSourceKeys.add(`${parsed.source}::${parsed.source_listing_id}`)
    }
    if (parsed.listing_id) {
      syncedListingIds.add(parsed.listing_id)
    }
  }

  // Find DB listings with sources that weren't in the sheet
  // Always run deletion pass — an empty sheet means all sourced listings should be removed
  {
    const { data: allSourced } = await supabase
      .from('listings')
      .select('listing_id, source, source_listing_id')
      .not('source', 'is', null)
      .not('source_listing_id', 'is', null)

    if (allSourced) {
      for (const listing of allSourced) {
        const key = `${listing.source}::${listing.source_listing_id}`
        if (
          !syncedSourceKeys.has(key) &&
          !syncedListingIds.has(listing.listing_id)
        ) {
          // Try hard-delete first; fall back to unlisted if FK prevents it
          const { error: deleteError } = await supabase
            .from('listings')
            .delete()
            .eq('listing_id', listing.listing_id)

          if (deleteError) {
            const { error: updateError } = await supabase
              .from('listings')
              .update({ status: 'unlisted' as never })
              .eq('listing_id', listing.listing_id)

            if (updateError) {
              report.errors++
              report.details.push(
                `Delete ${listing.listing_id}: soft-delete failed - ${updateError.message}`
              )
            } else {
              report.deleted++
              report.details.push(
                `Delete ${listing.listing_id}: soft-deleted (set unlisted)`
              )
            }
          } else {
            report.deleted++
            report.details.push(
              `Delete ${listing.listing_id}: hard-deleted (removed from sheet)`
            )
          }
        }
      }
    }
  }

  return report
}

const SHEET_HEADERS = [
  'listing_id',
  'brand',
  'model',
  'category',
  'condition_grade',
  'price_usd',
  'price_kes',
  'original_price_kes',
  'notes',
  'source',
  'source_listing_id',
  'source_url',
  'status',
  'images',
]

export async function syncToSheets(
  options: ExportOptions = {}
): Promise<ExportReport> {
  const mode = options.mode ?? 'additive'
  const report: ExportReport = { rows: 0, skipped: 0, errors: 0, details: [] }

  const spreadsheetId = process.env.GS_SPREADSHEET_ID
  if (!spreadsheetId) {
    throw new Error('Missing GS_SPREADSHEET_ID env var')
  }

  const supabase = createAdminClient()

  const { data: listings, error } = await supabase
    .from('listings')
    .select(
      '*, products:product_id(brand, model, slug, original_price_kes, categories:category_id(slug))'
    )
    .order('listing_id')

  if (error) {
    throw new Error(`Failed to fetch listings: ${error.message}`)
  }

  if (!listings || listings.length === 0) {
    report.details.push('No listings found in database')
    return report
  }

  type ListingRow = (typeof listings)[number]

  const sheetsClient = getGoogleSheetsClient()

  // In additive mode, read existing sheet to find which listing IDs are already present
  const existingIds = new Set<string>()
  if (mode === 'additive') {
    const existingRows = await fetchSheetData(
      sheetsClient,
      spreadsheetId,
      SHEETS_TAB_NAME
    )
    if (existingRows.length > 1) {
      const headers = existingRows[0]
      const idIndex = headers.indexOf('listing_id')
      if (idIndex < 0) {
        report.errors++
        report.details.push(
          'Additive sync aborted: existing sheet has rows but no listing_id header — refusing to overwrite'
        )
        return report
      }
      for (let i = 1; i < existingRows.length; i++) {
        const id = existingRows[i][idIndex]?.trim()
        if (id) existingIds.add(id)
      }
    }
  }

  /** Convert a listing row to a string array matching SHEET_HEADERS */
  function toRow(listing: ListingRow): string[] {
    const product = listing.products as unknown as {
      brand: string
      model: string
      original_price_kes: number | null
      categories: { slug: string } | null
    } | null

    return [
      listing.listing_id || '',
      product?.brand || '',
      product?.model || '',
      product?.categories?.slug || '',
      (listing.condition as string) || '',
      listing.original_price_usd?.toString() || '',
      listing.price_kes?.toString() || '',
      product?.original_price_kes?.toString() || '',
      listing.notes || '',
      listing.source || '',
      listing.source_listing_id || '',
      listing.source_url || '',
      (listing.status as string) || '',
      Array.isArray(listing.images) ? listing.images.join(',') : '',
    ]
  }

  if (mode === 'full') {
    // Full overwrite — replace entire sheet
    const sheetRows: string[][] = [SHEET_HEADERS]

    for (const listing of listings) {
      try {
        sheetRows.push(toRow(listing))
        report.rows++
      } catch (err) {
        report.errors++
        report.details.push(
          `Listing ${listing.listing_id}: Error - ${err instanceof Error ? err.message : String(err)}`
        )
      }
    }

    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: SHEETS_TAB_NAME,
      valueInputOption: 'RAW',
      requestBody: { values: sheetRows },
    })

    report.details.push(`Full sync: wrote ${report.rows} rows to sheet`)
  } else {
    // Additive — only append listings not already in the sheet
    const newRows: string[][] = []

    for (const listing of listings) {
      try {
        if (existingIds.has(listing.listing_id)) {
          report.skipped++
          continue
        }
        newRows.push(toRow(listing))
        report.rows++
      } catch (err) {
        report.errors++
        report.details.push(
          `Listing ${listing.listing_id}: Error - ${err instanceof Error ? err.message : String(err)}`
        )
      }
    }

    if (newRows.length === 0) {
      report.details.push(
        `Additive sync: no new listings to append (${report.skipped} already in sheet)`
      )
      return report
    }

    // If sheet is empty, write headers first then data
    if (existingIds.size === 0) {
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: SHEETS_TAB_NAME,
        valueInputOption: 'RAW',
        requestBody: { values: [SHEET_HEADERS, ...newRows] },
      })
    } else {
      await sheetsClient.spreadsheets.values.append({
        spreadsheetId,
        range: SHEETS_TAB_NAME,
        valueInputOption: 'RAW',
        requestBody: { values: newRows },
      })
    }

    report.details.push(
      `Additive sync: appended ${report.rows} new rows (${report.skipped} already in sheet)`
    )
  }

  return report
}

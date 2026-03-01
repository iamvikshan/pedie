import { google, type sheets_v4 } from 'googleapis'
import { createAdminClient } from '@lib/supabase/admin'
import { generateListingId, usdToKes, calculateDeposit } from '@helpers'
import { parseSheetRow } from '@lib/sheets/parser'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@app-types/database'

export { parseSheetRow } from '@lib/sheets/parser'
export type { SheetRow } from '@lib/sheets/parser'

export interface SyncReport {
  created: number
  updated: number
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
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
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
  const report: SyncReport = { created: 0, updated: 0, errors: 0, details: [] }

  const spreadsheetId = process.env.GS_SPREADSHEET_ID
  const sheetName = process.env.GS_SHEET_NAME || 'Inventory'

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

      const listingData = {
        product_id: productId,
        condition_grade:
          parsed.condition_grade as Database['public']['Enums']['condition_grade'],
        price_kes: priceKes,
        price_usd: parsed.price_usd ? parseFloat(parsed.price_usd) : null,
        original_price_kes: parsed.original_price_kes
          ? parseInt(parsed.original_price_kes, 10)
          : null,
        deposit_amount: calculateDeposit(priceKes),
        warranty_months: parsed.warranty_months
          ? parseInt(parsed.warranty_months, 10) || 3
          : 3,
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

  return report
}

export interface SheetRow {
  listing_id?: string
  brand: string
  model: string
  category: string
  condition_grade: string
  price_usd?: string
  price_kes?: string
  original_price_kes?: string
  warranty_months?: string
  notes?: string
  source?: string
  source_listing_id?: string
  source_url?: string
  status?: string
}

export function cleanNumericString(value: string): string {
  return value.replace(/[^0-9.-]/g, '')
}

export function parseSheetRow(
  row: string[],
  headers: string[]
): SheetRow | null {
  if (!row || row.length === 0) return null

  const data: Record<string, string> = {}
  headers.forEach((header, index) => {
    const key = header.toLowerCase().trim().replace(/\s+/g, '_')
    data[key] = row[index]?.trim() || ''
  })

  if (!data.brand || !data.model || !data.category) return null

  return {
    listing_id: data.listing_id || undefined,
    brand: data.brand,
    model: data.model,
    category: data.category,
    condition_grade: data.condition_grade || 'good',
    price_usd: data.price_usd ? cleanNumericString(data.price_usd) : undefined,
    price_kes: data.price_kes ? cleanNumericString(data.price_kes) : undefined,
    original_price_kes: data.original_price_kes
      ? cleanNumericString(data.original_price_kes)
      : undefined,
    warranty_months: data.warranty_months || undefined,
    notes: data.notes || undefined,
    source: data.source || undefined,
    source_listing_id: data.source_listing_id || undefined,
    source_url: data.source_url || undefined,
    status: data.status || undefined,
  }
}

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
  images?: string
  is_on_sale?: string
}

export function cleanNumericString(value: string): string {
  if (value == null) return ''
  if (typeof value !== 'string') value = String(value)
  // Detect negative: find a minus sign before the first digit
  const firstDigitIndex = value.search(/\d/)
  const hasNegative =
    firstDigitIndex > -1
      ? value.slice(0, firstDigitIndex).includes('-')
      : value.includes('-')
  // Strip everything except digits and dots
  const raw = value.replace(/[^0-9.]/g, '')
  // Keep only the first decimal point
  const firstDot = raw.indexOf('.')
  const digits =
    firstDot === -1
      ? raw
      : raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, '')
  // Return empty string for invalid results
  if (!digits || digits === '.') return ''
  return hasNegative ? `-${digits}` : digits
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
    price_usd: data.price_usd
      ? cleanNumericString(data.price_usd) || undefined
      : undefined,
    price_kes: data.price_kes
      ? cleanNumericString(data.price_kes) || undefined
      : undefined,
    original_price_kes: data.original_price_kes
      ? cleanNumericString(data.original_price_kes) || undefined
      : undefined,
    warranty_months: data.warranty_months || undefined,
    notes: data.notes || undefined,
    source: data.source || undefined,
    source_listing_id: data.source_listing_id || undefined,
    source_url: data.source_url || undefined,
    status: data.status || undefined,
    images: data.images || undefined,
    is_on_sale: data.is_on_sale || undefined,
  }
}

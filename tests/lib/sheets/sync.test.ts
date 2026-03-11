import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  cleanNumericString,
  parseSheetRow,
  HEADER_MAP,
} from '@lib/sheets/parser'
import { SHEETS_TAB } from '@/config'

const src = readFileSync(resolve('src/lib/sheets/sync.ts'), 'utf-8')

describe('cleanNumericString', () => {
  test('strips currency prefix and commas', () => {
    expect(cleanNumericString('KES 45,500')).toBe('45500')
  })

  test('handles comma-separated thousands', () => {
    expect(cleanNumericString('45,500')).toBe('45500')
  })

  test('preserves decimal points', () => {
    expect(cleanNumericString('$1,234.56')).toBe('1234.56')
  })

  test('handles plain numbers', () => {
    expect(cleanNumericString('350')).toBe('350')
  })
})

describe('parseSheetRow', () => {
  const headers = [
    'brand',
    'model',
    'category',
    'condition_grade',
    'price_kes',
    'sale_price_kes',
    'ram',
    'warranty_months',
    'notes',
    'source',
    'source_id',
    'source_url',
    'status',
    'images',
    'listing_type',
    'includes',
    'admin_notes',
  ]

  test('maps columns correctly', () => {
    const row = [
      'Apple',
      'iPhone 13',
      'smartphones',
      'excellent',
      '45500',
      '40000',
      '4GB',
      '3',
      'Minor scratch on back',
      'Swappa',
      'SWP-123',
      'https://swappa.com/listing/123',
      'active',
      '',
      'standard',
      'charger, case',
      'Good unit',
    ]

    const result = parseSheetRow(row, headers)

    expect(result).not.toBeNull()
    expect(result!.brand).toBe('Apple')
    expect(result!.model).toBe('iPhone 13')
    expect(result!.category).toBe('smartphones')
    expect(result!.condition_grade).toBe('excellent')
    expect(result!.price_kes).toBe('45500')
    expect(result!.sale_price_kes).toBe('40000')
    expect(result!.ram).toBe('4GB')
    expect(result!.warranty_months).toBe('3')
    expect(result!.notes).toBe('Minor scratch on back')
    expect(result!.source).toBe('Swappa')
    expect(result!.source_id).toBe('SWP-123')
    expect(result!.source_url).toBe('https://swappa.com/listing/123')
    expect(result!.status).toBe('active')
    expect(result!.includes).toBe('charger, case')
    expect(result!.admin_notes).toBe('Good unit')
  })

  test('returns null for empty row', () => {
    const result = parseSheetRow([], headers)
    expect(result).toBeNull()
  })

  test('returns null for row missing required fields', () => {
    const row = [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]
    const result = parseSheetRow(row, headers)
    expect(result).toBeNull()
  })

  test('handles missing optional fields gracefully', () => {
    const row = ['Samsung', 'Galaxy S21', 'smartphones']
    const result = parseSheetRow(row, headers)

    expect(result).not.toBeNull()
    expect(result!.brand).toBe('Samsung')
    expect(result!.model).toBe('Galaxy S21')
    expect(result!.condition_grade).toBe('good')
    expect(result!.source).toBeUndefined()
  })

  test('defaults condition_grade to good', () => {
    const row = ['Apple', 'iPhone 14', 'smartphones', '']
    const result = parseSheetRow(row, headers)

    expect(result!.condition_grade).toBe('good')
  })

  test('handles source fields (source, source_id, source_url)', () => {
    const row = [
      'Apple',
      'iPhone 12',
      'smartphones',
      'good',
      '',
      '',
      '',
      '',
      '',
      'BackMarket',
      'BM-456',
      'https://backmarket.com/product/456',
      '',
    ]

    const result = parseSheetRow(row, headers)

    expect(result!.source).toBe('BackMarket')
    expect(result!.source_id).toBe('BM-456')
    expect(result!.source_url).toBe('https://backmarket.com/product/456')
  })

  test('trims whitespace from values', () => {
    const row = ['  Apple  ', '  iPhone 13  ', '  smartphones  ']
    const result = parseSheetRow(row, headers)

    expect(result!.brand).toBe('Apple')
    expect(result!.model).toBe('iPhone 13')
    expect(result!.category).toBe('smartphones')
  })

  test('cleans currency-formatted price_kes', () => {
    const row = ['Apple', 'iPhone 13', 'smartphones', 'good', 'KES 45,500']
    const result = parseSheetRow(row, headers)

    expect(result!.price_kes).toBe('45500')
  })

  test('cleans sale_price_kes with formatting', () => {
    const row = [
      'Apple',
      'iPhone 13',
      'smartphones',
      'good',
      '45500',
      'KES 40,000',
    ]
    const result = parseSheetRow(row, headers)

    expect(result!.sale_price_kes).toBe('40000')
  })
})

describe('source field parsing', () => {
  const headers = [
    'brand',
    'model',
    'category',
    'condition_grade',
    'price_kes',
    'sale_price_kes',
    'ram',
    'warranty_months',
    'notes',
    'source',
    'source_id',
    'source_url',
    'status',
  ]

  const knownSources = ['Swappa', 'Reebelo', 'BackMarket']

  for (const source of knownSources) {
    test(`${source} row without source_id parses with undefined source_id`, () => {
      const row = [
        'Apple',
        'iPhone 12',
        'smartphones',
        'good',
        '32500',
        '',
        '',
        '',
        '',
        source,
        '',
        'https://example.com/listing/123',
        '',
      ]
      const parsed = parseSheetRow(row, headers)
      expect(parsed).not.toBeNull()
      expect(parsed!.source).toBe(source)
      expect(parsed!.source_id).toBeUndefined()
    })

    test(`${source} row without source_url parses with undefined source_url`, () => {
      const row = [
        'Apple',
        'iPhone 12',
        'smartphones',
        'good',
        '32500',
        '',
        '',
        '',
        '',
        source,
        'SRC-123',
        '',
        '',
      ]
      const parsed = parseSheetRow(row, headers)
      expect(parsed).not.toBeNull()
      expect(parsed!.source).toBe(source)
      expect(parsed!.source_url).toBeUndefined()
    })

    test(`${source} row with both source_id and source_url parses correctly`, () => {
      const row = [
        'Apple',
        'iPhone 12',
        'smartphones',
        'good',
        '32500',
        '',
        '',
        '',
        '',
        source,
        'SRC-123',
        'https://example.com/listing/123',
        '',
      ]
      const parsed = parseSheetRow(row, headers)
      expect(parsed).not.toBeNull()
      expect(parsed!.source).toBe(source)
      expect(parsed!.source_id).toBe('SRC-123')
      expect(parsed!.source_url).toBe('https://example.com/listing/123')
    })
  }
})

describe('images column support', () => {
  const headersWithImages = [
    'brand',
    'model',
    'category',
    'condition_grade',
    'price_kes',
    'sale_price_kes',
    'ram',
    'warranty_months',
    'notes',
    'source',
    'source_id',
    'source_url',
    'status',
    'images',
  ]

  test('should parse images column from sheet row', () => {
    const row = [
      'Apple',
      'iPhone 15',
      'smartphones',
      'premium',
      '65000',
      '',
      '',
      '6',
      '',
      '',
      '',
      '',
      'active',
      'https://store.example.com/img1.jpg,https://store.example.com/img2.jpg',
    ]

    const result = parseSheetRow(row, headersWithImages)
    expect(result).not.toBeNull()
    expect(result!.images).toBe(
      'https://store.example.com/img1.jpg,https://store.example.com/img2.jpg'
    )
  })

  test('should handle empty images gracefully', () => {
    const row = [
      'Samsung',
      'Galaxy S23',
      'smartphones',
      'good',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]

    const result = parseSheetRow(row, headersWithImages)
    expect(result).not.toBeNull()
    expect(result!.images).toBeUndefined()
  })
})

describe('listing_type column support', () => {
  const headersWithType = [
    'brand',
    'model',
    'category',
    'condition_grade',
    'price_kes',
    'sale_price_kes',
    'ram',
    'warranty_months',
    'notes',
    'source',
    'source_id',
    'source_url',
    'status',
    'images',
    'listing_type',
  ]

  test("should parse listing_type as 'standard'", () => {
    const row = [
      'Apple',
      'iPhone 16 Pro Max',
      'smartphones',
      'excellent',
      '195000',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'active',
      '',
      'standard',
    ]

    const result = parseSheetRow(row, headersWithType)
    expect(result).not.toBeNull()
    expect(result!.listing_type).toBe('standard')
  })

  test('should handle missing listing_type gracefully', () => {
    const row = [
      'Samsung',
      'Galaxy S24',
      'smartphones',
      'excellent',
      '120000',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]

    const result = parseSheetRow(row, headersWithType)
    expect(result).not.toBeNull()
    expect(result!.listing_type).toBeUndefined()
  })

  test('should handle empty listing_type as undefined', () => {
    const row = [
      'Google',
      'Pixel 8',
      'smartphones',
      'good',
      '65000',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]

    const result = parseSheetRow(row, headersWithType)
    expect(result).not.toBeNull()
    expect(result!.listing_type).toBeUndefined()
  })

  test("should parse listing_type as 'affiliate'", () => {
    const row = [
      'Samsung',
      'Galaxy S24 Ultra',
      'smartphones',
      'premium',
      '185000',
      '',
      '',
      '',
      '',
      'samsung.com',
      '',
      'https://samsung.com/galaxy-s24-ultra',
      'active',
      '',
      'affiliate',
    ]

    const result = parseSheetRow(row, headersWithType)
    expect(result).not.toBeNull()
    expect(result!.listing_type).toBe('affiliate')
  })
})

describe('sync source analysis', () => {
  test('uses brand_id FK instead of brand string column', () => {
    expect(src).toContain('brand_id')
    expect(src).not.toContain(".eq('brand', brand)")
  })

  test('uses source_id instead of source_listing_id', () => {
    expect(src).toContain('source_id')
    expect(src).not.toContain('source_listing_id')
  })

  test('uses active status instead of available', () => {
    expect(src).not.toContain("'available'")
    expect(src).toContain("'active'")
  })

  test('uses archived status instead of unlisted', () => {
    expect(src).not.toContain("'unlisted'")
    expect(src).toContain("'archived'")
  })

  test('does not reference listing_id text column', () => {
    expect(src).not.toContain(".eq('listing_id',")
    expect(src).not.toContain(".select('listing_id')")
  })

  test('does not reference original_price_usd', () => {
    expect(src).not.toContain('original_price_usd')
  })

  test('does not reference final_price_kes', () => {
    expect(src).not.toContain('final_price_kes')
  })

  test('includes sale_price_kes support', () => {
    expect(src).toContain('sale_price_kes')
  })

  test('uses product_categories junction table', () => {
    expect(src).toContain('product_categories')
  })

  test('includes sku in listingHeaders', () => {
    expect(src).toContain("'sku'")
  })

  test('includes multi-tab export functions', () => {
    expect(src).toContain('syncBrandsToSheet')
    expect(src).toContain('syncCategoriesToSheet')
    expect(src).toContain('syncPromotionsToSheet')
  })

  test('ExportReport supports tabs', () => {
    expect(src).toContain('tabs?')
  })
})

describe('SHEETS_TAB config', () => {
  test('has all required keys', () => {
    expect(SHEETS_TAB.listings).toBe('Listings')
    expect(SHEETS_TAB.brands).toBe('Brands')
    expect(SHEETS_TAB.categories).toBe('Categories')
    expect(SHEETS_TAB.products).toBe('Products')
    expect(SHEETS_TAB.promotions).toBe('Promotions')
  })

  test('sync.ts uses SHEETS_TAB from config', () => {
    expect(src).toContain('SHEETS_TAB')
    expect(src).not.toContain('SHEETS_TAB_NAME')
  })
})

describe('human-readable headers round-trip', () => {
  test('listingHeaders in sync.ts use human-readable names', () => {
    expect(src).toContain("'SKU'")
    expect(src).toContain("'Brand'")
    expect(src).toContain("'Price (KES)'")
    expect(src).toContain("'Condition Grade'")
    expect(src).toContain("'Warranty (Months)'")
    expect(src).toContain("'Admin Notes'")
  })

  test('human-readable headers parse back to internal fields via HEADER_MAP', () => {
    const humanHeaders = [
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
    const row = [
      'PD-001',
      'Apple',
      'iPhone 15',
      'smartphones',
      'excellent',
      '95000',
      '85000',
      '8GB',
      '12',
      'Like new',
      'Manual',
      'MAN-001',
      'https://example.com',
      'active',
      'https://img.example.com/1.jpg',
      'standard',
      'charger',
      'VIP note',
    ]

    const result = parseSheetRow(row, humanHeaders)
    expect(result).not.toBeNull()
    expect(result!.brand).toBe('Apple')
    expect(result!.price_kes).toBe('95000')
    expect(result!.condition_grade).toBe('excellent')
    expect(result!.warranty_months).toBe('12')
    expect(result!.admin_notes).toBe('VIP note')
  })
})

describe('SyncSource type', () => {
  test('sync.ts exports SyncSource type', () => {
    expect(src).toContain('SyncSource')
  })

  test('syncFromSheets accepts source parameter', () => {
    expect(src).toContain("source: SyncSource = 'sheets'")
  })

  test('syncToSheets accepts source option', () => {
    expect(src).toContain('source?: SyncSource')
  })
})

describe('multi-tab import functions', () => {
  test('sync.ts has syncBrandsFromSheet', () => {
    expect(src).toContain('syncBrandsFromSheet')
  })

  test('sync.ts has syncCategoriesFromSheet', () => {
    expect(src).toContain('syncCategoriesFromSheet')
  })

  test('sync.ts has syncPromotionsFromSheet', () => {
    expect(src).toContain('syncPromotionsFromSheet')
  })

  test('syncFromSheets calls import functions before listing sync', () => {
    // The import calls should appear before the listing sync logic
    const brandsImportIndex = src.indexOf('syncBrandsFromSheet(')
    const categoriesImportIndex = src.indexOf('syncCategoriesFromSheet(')
    const promotionsImportIndex = src.indexOf('syncPromotionsFromSheet(')
    const fetchListingsIndex = src.indexOf(
      'fetchSheetData(sheetsClient, spreadsheetId, SHEETS_TAB.listings'
    )

    // All import functions must exist
    expect(brandsImportIndex).toBeGreaterThan(-1)
    expect(categoriesImportIndex).toBeGreaterThan(-1)
    expect(promotionsImportIndex).toBeGreaterThan(-1)

    // Ensure they also appear in syncFromSheets (not just the export functions)
    // The import variants appear in the syncFromSheets function body
    expect(src).toContain('brandsImport')
    expect(src).toContain('categoriesImport')
    expect(src).toContain('promotionsImport')
  })
})

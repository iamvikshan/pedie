import { describe, expect, test } from 'bun:test'
import { parseSheetRow, HEADER_MAP } from '@lib/sheets/parser'

describe('parseSheetRow images support', () => {
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
  ]

  test('should include images in parsed row', () => {
    const row = [
      'Apple',
      'iPhone 14',
      'smartphones',
      'excellent',
      '52000',
      '',
      '',
      '6',
      '',
      'Manual',
      '',
      '',
      'active',
      'https://storage.example.com/a.jpg,https://storage.example.com/b.jpg',
    ]

    const result = parseSheetRow(row, headers)

    expect(result).not.toBeNull()
    expect(result!.images).toBe(
      'https://storage.example.com/a.jpg,https://storage.example.com/b.jpg'
    )
  })

  test('should return undefined images when column is empty', () => {
    const row = [
      'Samsung',
      'Galaxy S22',
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

    const result = parseSheetRow(row, headers)

    expect(result).not.toBeNull()
    expect(result!.images).toBeUndefined()
  })
})

describe('HEADER_MAP', () => {
  test('is exported and covers all SheetRow fields', () => {
    expect(HEADER_MAP).toBeDefined()
    // Human-readable keys
    expect(HEADER_MAP['price (kes)']).toBe('price_kes')
    expect(HEADER_MAP['sale price (kes)']).toBe('sale_price_kes')
    expect(HEADER_MAP['condition grade']).toBe('condition_grade')
    expect(HEADER_MAP['warranty (months)']).toBe('warranty_months')
    expect(HEADER_MAP['source id']).toBe('source_id')
    expect(HEADER_MAP['source url']).toBe('source_url')
    expect(HEADER_MAP['listing type']).toBe('listing_type')
    expect(HEADER_MAP['admin notes']).toBe('admin_notes')
    // Backward-compat snake_case keys
    expect(HEADER_MAP['price_kes']).toBe('price_kes')
    expect(HEADER_MAP['condition_grade']).toBe('condition_grade')
  })
})

describe('parseSheetRow with human-readable headers', () => {
  const humanHeaders = [
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

  test('parses human-readable headers correctly', () => {
    const row = [
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
      'VIP customer return',
    ]

    const result = parseSheetRow(row, humanHeaders)
    expect(result).not.toBeNull()
    expect(result!.brand).toBe('Apple')
    expect(result!.model).toBe('iPhone 15')
    expect(result!.condition_grade).toBe('excellent')
    expect(result!.price_kes).toBe('95000')
    expect(result!.sale_price_kes).toBe('85000')
    expect(result!.warranty_months).toBe('12')
    expect(result!.source_id).toBe('MAN-001')
    expect(result!.listing_type).toBe('standard')
    expect(result!.admin_notes).toBe('VIP customer return')
  })

  test('handles backward-compatible snake_case headers', () => {
    const snakeHeaders = [
      'brand',
      'model',
      'category',
      'condition_grade',
      'price_kes',
    ]
    const row = ['Samsung', 'Galaxy S24', 'smartphones', 'good', '120000']

    const result = parseSheetRow(row, snakeHeaders)
    expect(result).not.toBeNull()
    expect(result!.brand).toBe('Samsung')
    expect(result!.price_kes).toBe('120000')
  })
})

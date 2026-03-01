import { describe, expect, test } from 'bun:test'
import { parseSheetRow, cleanNumericString } from '@lib/sheets/parser'

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
    'listing_id',
    'brand',
    'model',
    'category',
    'condition_grade',
    'price_usd',
    'price_kes',
    'original_price_kes',
    'warranty_months',
    'notes',
    'source',
    'source_listing_id',
    'source_url',
    'status',
  ]

  test('maps columns correctly', () => {
    const row = [
      'PD-ABC12',
      'Apple',
      'iPhone 13',
      'smartphones',
      'excellent',
      '350',
      '45500',
      '55000',
      '3',
      'Minor scratch on back',
      'Swappa',
      'SWP-123',
      'https://swappa.com/listing/123',
      'available',
    ]

    const result = parseSheetRow(row, headers)

    expect(result).not.toBeNull()
    expect(result!.listing_id).toBe('PD-ABC12')
    expect(result!.brand).toBe('Apple')
    expect(result!.model).toBe('iPhone 13')
    expect(result!.category).toBe('smartphones')
    expect(result!.condition_grade).toBe('excellent')
    expect(result!.price_usd).toBe('350')
    expect(result!.price_kes).toBe('45500')
    expect(result!.original_price_kes).toBe('55000')
    expect(result!.warranty_months).toBe('3')
    expect(result!.notes).toBe('Minor scratch on back')
    expect(result!.source).toBe('Swappa')
    expect(result!.source_listing_id).toBe('SWP-123')
    expect(result!.source_url).toBe('https://swappa.com/listing/123')
    expect(result!.status).toBe('available')
  })

  test('returns null for empty row', () => {
    const result = parseSheetRow([], headers)
    expect(result).toBeNull()
  })

  test('returns null for row missing required fields', () => {
    const row = ['', '', '', '', '', '', '', '', '', '', '', '', '', '']
    const result = parseSheetRow(row, headers)
    expect(result).toBeNull()
  })

  test('handles missing optional fields gracefully', () => {
    const row = ['', 'Samsung', 'Galaxy S21', 'smartphones']
    const result = parseSheetRow(row, headers)

    expect(result).not.toBeNull()
    expect(result!.listing_id).toBeUndefined()
    expect(result!.brand).toBe('Samsung')
    expect(result!.model).toBe('Galaxy S21')
    expect(result!.condition_grade).toBe('good') // default
    expect(result!.price_usd).toBeUndefined()
    expect(result!.source).toBeUndefined()
  })

  test('defaults condition_grade to good', () => {
    const row = ['', 'Apple', 'iPhone 14', 'smartphones', '']
    const result = parseSheetRow(row, headers)

    expect(result!.condition_grade).toBe('good')
  })

  test('handles source_listing_id for crawler imports', () => {
    const row = [
      '',
      'Apple',
      'iPhone 12',
      'smartphones',
      'good',
      '250',
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
    expect(result!.source_listing_id).toBe('BM-456')
    expect(result!.source_url).toBe('https://backmarket.com/product/456')
  })

  test('trims whitespace from values', () => {
    const row = ['', '  Apple  ', '  iPhone 13  ', '  smartphones  ']
    const result = parseSheetRow(row, headers)

    expect(result!.brand).toBe('Apple')
    expect(result!.model).toBe('iPhone 13')
    expect(result!.category).toBe('smartphones')
  })

  test('cleans currency-formatted price_kes', () => {
    const row = [
      '',
      'Apple',
      'iPhone 13',
      'smartphones',
      'good',
      '',
      'KES 45,500',
    ]
    const result = parseSheetRow(row, headers)

    expect(result!.price_kes).toBe('45500')
  })

  test('cleans comma-separated price_usd', () => {
    const row = ['', 'Apple', 'iPhone 13', 'smartphones', 'good', '$1,350']
    const result = parseSheetRow(row, headers)

    expect(result!.price_usd).toBe('1350')
  })
})

describe('crawler field validation', () => {
  const headers = [
    'listing_id',
    'brand',
    'model',
    'category',
    'condition_grade',
    'price_usd',
    'price_kes',
    'original_price_kes',
    'warranty_months',
    'notes',
    'source',
    'source_listing_id',
    'source_url',
    'status',
  ]

  const crawlerSources = ['Swappa', 'Reebelo', 'BackMarket']

  for (const source of crawlerSources) {
    test(`${source} row without source_listing_id is missing required field`, () => {
      const row = [
        '',
        'Apple',
        'iPhone 12',
        'smartphones',
        'good',
        '250',
        '',
        '',
        '',
        '',
        source,
        '', // missing source_listing_id
        'https://example.com/listing/123',
        '',
      ]
      const parsed = parseSheetRow(row, headers)
      expect(parsed).not.toBeNull()
      expect(parsed!.source).toBe(source)
      expect(parsed!.source_listing_id).toBeUndefined()
    })

    test(`${source} row without source_url is missing required field`, () => {
      const row = [
        '',
        'Apple',
        'iPhone 12',
        'smartphones',
        'good',
        '250',
        '',
        '',
        '',
        '',
        source,
        'SRC-123',
        '', // missing source_url
        '',
      ]
      const parsed = parseSheetRow(row, headers)
      expect(parsed).not.toBeNull()
      expect(parsed!.source).toBe(source)
      expect(parsed!.source_url).toBeUndefined()
    })

    test(`${source} row with both source_listing_id and source_url is valid`, () => {
      const row = [
        '',
        'Apple',
        'iPhone 12',
        'smartphones',
        'good',
        '250',
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
      expect(parsed!.source_listing_id).toBe('SRC-123')
      expect(parsed!.source_url).toBe('https://example.com/listing/123')
    })
  }
})

describe('images column support', () => {
  const headersWithImages = [
    'listing_id',
    'brand',
    'model',
    'category',
    'condition_grade',
    'price_usd',
    'price_kes',
    'original_price_kes',
    'warranty_months',
    'notes',
    'source',
    'source_listing_id',
    'source_url',
    'status',
    'images',
  ]

  test('should parse images column from sheet row', () => {
    const row = [
      '',
      'Apple',
      'iPhone 15',
      'smartphones',
      'premium',
      '500',
      '65000',
      '75000',
      '6',
      '',
      '',
      '',
      '',
      'available',
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
      '',
      'Samsung',
      'Galaxy S23',
      'smartphones',
      'good',
      '400',
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

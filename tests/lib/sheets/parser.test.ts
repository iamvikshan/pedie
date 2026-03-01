import { describe, expect, test } from 'bun:test'
import { parseSheetRow } from '@lib/sheets/parser'

describe('parseSheetRow images support', () => {
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
    'images',
  ]

  test('should include images in parsed row', () => {
    const row = [
      'PD-IMG01',
      'Apple',
      'iPhone 14',
      'smartphones',
      'excellent',
      '400',
      '52000',
      '60000',
      '6',
      '',
      'Manual',
      '',
      '',
      'available',
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
      '',
      'Samsung',
      'Galaxy S22',
      'smartphones',
      'good',
      '300',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '', // empty images
    ]

    const result = parseSheetRow(row, headers)

    expect(result).not.toBeNull()
    expect(result!.images).toBeUndefined()
  })
})

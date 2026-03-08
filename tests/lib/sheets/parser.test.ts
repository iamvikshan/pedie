import { describe, expect, test } from 'bun:test'
import { parseSheetRow } from '@lib/sheets/parser'

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

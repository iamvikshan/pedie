import { describe, expect, test } from 'bun:test'
import { generateListingId } from '@helpers/listing'

describe('generateListingId', () => {
  test('returns string matching PD-XXXXX pattern', () => {
    const id = generateListingId()
    expect(id).toMatch(/^PD-[0-9A-Z]{5}$/)
  })

  test('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateListingId()))
    expect(ids.size).toBe(100)
  })
})

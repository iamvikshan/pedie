import { describe, expect, test } from 'bun:test'
// Test that the privacy page module exports correctly
import PrivacyPage, { metadata } from '@/app/(store)/privacy/page'

describe('Privacy Page', () => {
  test('exports metadata with title', () => {
    expect(metadata.title).toBe('Privacy Policy')
  })

  test('exports metadata with description', () => {
    expect(typeof metadata.description).toBe('string')
  })

  test('exports a default page component', () => {
    expect(typeof PrivacyPage).toBe('function')
  })
})

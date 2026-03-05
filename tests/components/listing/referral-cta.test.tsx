import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(
  resolve('src/components/listing/referralCta.tsx'),
  'utf-8'
)

describe('ReferralCta', () => {
  test('imports TbBrandWhatsapp icon', () => {
    expect(src).toContain('TbBrandWhatsapp')
  })

  test('imports WHATSAPP_NUMBER from config', () => {
    expect(src).toContain('WHATSAPP_NUMBER')
    expect(src).toContain('@/config')
  })

  test('generates wa.me URL with phone number', () => {
    expect(src).toContain('wa.me/')
    expect(src).toContain(".replace('+', '')")
  })

  test('includes product brand, model and listing_id in message', () => {
    expect(src).toContain('brand')
    expect(src).toContain('model')
    expect(src).toContain('listing.listing_id')
  })

  test('encodes message for URL', () => {
    expect(src).toContain('encodeURIComponent')
  })

  test('defensively defaults product brand and model', () => {
    expect(src).toContain("product?.brand || ''")
    expect(src).toContain("product?.model || ''")
  })

  test('validates WHATSAPP_NUMBER before building URL', () => {
    expect(src).toContain("(WHATSAPP_NUMBER || '')")
    expect(src).toContain('phoneNumber ?')
    expect(src).toContain('wa.me/')
  })

  test('renders short "WhatsApp" button text', () => {
    expect(src).toMatch(/>\s*WhatsApp\s*</) // text content between tags
    // Should NOT have wordy text
    expect(src).not.toContain('Ask about this on WhatsApp')
  })

  test('opens in new tab', () => {
    expect(src).toContain("target='_blank'")
    expect(src).toContain("rel='noopener noreferrer'")
  })

  test('has accessible aria-label with product name', () => {
    expect(src).toContain('aria-label')
    expect(src).toContain('WhatsApp')
  })

  test('uses green-600 background (WhatsApp brand color)', () => {
    expect(src).toContain('bg-green-600')
  })
})

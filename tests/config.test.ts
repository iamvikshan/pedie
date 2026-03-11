import { describe, expect, test } from 'bun:test'
import { SITE_NAME, URLS, SHEETS_TAB } from '@/config'

describe('Config', () => {
  test('SITE_NAME is Pedie', () => {
    expect(SITE_NAME).toBe('Pedie')
  })

  test('URLS contains social media links', () => {
    expect(URLS.social).toBeDefined()
    expect(URLS.social.x).toContain('iamvikshan')
    expect(URLS.social.youtube).toContain('vikshan')
    expect(URLS.social.instagram).toContain('iamvikshan')
    expect(URLS.social.github).toContain('iamvikshan')
    expect(URLS.social.tiktok).toContain('iamvikshan')
  })

  test('SHEETS_TAB has all required keys', () => {
    expect(SHEETS_TAB.listings).toBe('Listings')
    expect(SHEETS_TAB.brands).toBe('Brands')
    expect(SHEETS_TAB.categories).toBe('Categories')
    expect(SHEETS_TAB.products).toBe('Products')
    expect(SHEETS_TAB.promotions).toBe('Promotions')
  })

  test('SHEETS_TAB_NAME is no longer exported', async () => {
    const config = await import('@/config')
    expect('SHEETS_TAB_NAME' in config).toBe(false)
  })

  test('LISTING_ID_PREFIX is not exported', async () => {
    const config = await import('@/config')
    expect('LISTING_ID_PREFIX' in config).toBe(false)
  })

  test('DEFAULT_COLLECTION_HREF is exported', async () => {
    const { DEFAULT_COLLECTION_HREF } = await import('@/config')
    expect(DEFAULT_COLLECTION_HREF).toBe('/collections')
  })
})

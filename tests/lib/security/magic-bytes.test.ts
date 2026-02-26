import { describe, test, expect } from 'bun:test'
import { detectMimeType, validateMagicBytes } from '@lib/security/magic-bytes'

describe('magic-bytes', () => {
  test('detects JPEG', () => {
    const buf = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0,
    ])
    expect(detectMimeType(buf)).toBe('image/jpeg')
  })

  test('detects PNG', () => {
    const buf = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ])
    expect(detectMimeType(buf)).toBe('image/png')
  })

  test('detects GIF', () => {
    const buf = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0,
    ])
    expect(detectMimeType(buf)).toBe('image/gif')
  })

  test('detects WebP', () => {
    // RIFF....WEBP
    const buf = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
    ])
    expect(detectMimeType(buf)).toBe('image/webp')
  })

  test('returns null for RIFF without WEBP marker', () => {
    const buf = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x20,
    ])
    expect(detectMimeType(buf)).toBeNull()
  })

  test('returns null for unknown format', () => {
    const buf = Buffer.from([0x00, 0x00, 0x00, 0x00, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(detectMimeType(buf)).toBeNull()
  })

  test('returns null for buffer too small', () => {
    const buf = Buffer.from([0xff, 0xd8])
    expect(detectMimeType(buf)).toBeNull()
  })

  test('validateMagicBytes returns true for matching MIME', () => {
    const buf = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ])
    expect(validateMagicBytes(buf, 'image/png')).toBe(true)
  })

  test('validateMagicBytes returns false for mismatched MIME', () => {
    const buf = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ])
    expect(validateMagicBytes(buf, 'image/jpeg')).toBe(false)
  })

  test('validateMagicBytes returns false for unknown format', () => {
    const buf = Buffer.from([0x00, 0x00, 0x00, 0x00, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(validateMagicBytes(buf, 'image/jpeg')).toBe(false)
  })
})

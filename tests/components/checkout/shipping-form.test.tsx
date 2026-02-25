import { describe, test, expect } from 'bun:test'
import { validateKenyanPhone } from '@components/checkout/shipping-form'

describe('ShippingForm', () => {
  describe('validateKenyanPhone', () => {
    test('accepts +254 format', () => {
      expect(validateKenyanPhone('+254712345678')).toBe(true)
    })
    test('accepts 07 format', () => {
      expect(validateKenyanPhone('0712345678')).toBe(true)
    })
    test('accepts 01 format', () => {
      expect(validateKenyanPhone('0112345678')).toBe(true)
    })
    test('accepts 254 format without +', () => {
      expect(validateKenyanPhone('254712345678')).toBe(true)
    })
    test('accepts phone with spaces', () => {
      expect(validateKenyanPhone('0712 345 678')).toBe(true)
    })
    test('accepts phone with dashes', () => {
      expect(validateKenyanPhone('0712-345-678')).toBe(true)
    })
    test('rejects too short', () => {
      expect(validateKenyanPhone('071234')).toBe(false)
    })
    test('rejects too long', () => {
      expect(validateKenyanPhone('07123456789999')).toBe(false)
    })
    test('rejects invalid prefix', () => {
      expect(validateKenyanPhone('0512345678')).toBe(false)
    })
    test('rejects empty', () => {
      expect(validateKenyanPhone('')).toBe(false)
    })
  })
})

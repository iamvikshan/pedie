import { describe, expect, test } from 'bun:test'
import type { STKCallback } from '@lib/payments/mpesa'
import {
  formatPhoneForDaraja,
  generatePassword,
  getTimestamp,
  parseCallback,
} from '@lib/payments/mpesa'

describe('M-Pesa Daraja Client', () => {
  describe('formatPhoneForDaraja', () => {
    test('formats 07XXXXXXXX to 254XXXXXXXXX', () => {
      expect(formatPhoneForDaraja('0712345678')).toBe('254712345678')
    })
    test('formats +254XXXXXXXXX to 254XXXXXXXXX', () => {
      expect(formatPhoneForDaraja('+254712345678')).toBe('254712345678')
    })
    test('formats 254XXXXXXXXX as-is', () => {
      expect(formatPhoneForDaraja('254712345678')).toBe('254712345678')
    })
    test('strips non-numeric characters', () => {
      expect(formatPhoneForDaraja('0712-345-678')).toBe('254712345678')
    })
    test('handles 01XXXXXXXX format', () => {
      expect(formatPhoneForDaraja('0112345678')).toBe('254112345678')
    })
  })

  describe('generatePassword', () => {
    test('generates base64 encoded password', () => {
      const password = generatePassword('174379', 'testkey', '20250101120000')
      const decoded = Buffer.from(password, 'base64').toString()
      expect(decoded).toBe('174379testkey20250101120000')
    })
  })

  describe('getTimestamp', () => {
    test('returns YYYYMMDDHHmmss format', () => {
      const ts = getTimestamp()
      expect(ts).toMatch(/^\d{14}$/)
    })
  })

  describe('parseCallback', () => {
    test('parses successful callback', () => {
      const body: STKCallback = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'mid-123',
            CheckoutRequestID: 'cid-456',
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 1000 },
                { Name: 'MpesaReceiptNumber', Value: 'ABC123' },
                { Name: 'TransactionDate', Value: '20250601120000' },
                { Name: 'PhoneNumber', Value: '254712345678' },
              ],
            },
          },
        },
      }
      const result = parseCallback(body)
      expect(result.success).toBe(true)
      expect(result.merchantRequestId).toBe('mid-123')
      expect(result.checkoutRequestId).toBe('cid-456')
      expect(result.amount).toBe(1000)
      expect(result.mpesaReceiptNumber).toBe('ABC123')
      expect(result.phoneNumber).toBe('254712345678')
    })

    test('parses failed callback', () => {
      const body: STKCallback = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'mid-789',
            CheckoutRequestID: 'cid-012',
            ResultCode: 1032,
            ResultDesc: 'Request cancelled by user.',
          },
        },
      }
      const result = parseCallback(body)
      expect(result.success).toBe(false)
      expect(result.resultCode).toBe(1032)
      expect(result.resultDesc).toBe('Request cancelled by user.')
      expect(result.amount).toBeUndefined()
    })
  })
})

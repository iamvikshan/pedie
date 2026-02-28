import { describe, test, expect } from 'bun:test'
import { kesToUsd } from '@utils/currency'
import { getApprovalUrl } from '@lib/payments/paypal'
import type { PayPalOrder } from '@lib/payments/paypal'

describe('PayPal Client', () => {
  describe('kesToUsd', () => {
    test('converts KES to USD with 2 decimal places', () => {
      expect(kesToUsd(10000)).toBe('76.92')
    })

    test('converts small amounts', () => {
      expect(kesToUsd(100)).toBe('0.77')
    })

    test('converts zero', () => {
      expect(kesToUsd(0)).toBe('0.00')
    })

    test('rounds to 2 decimal places', () => {
      const result = kesToUsd(1234)
      expect(result).toMatch(/^\d+\.\d{2}$/)
    })

    test('converts large amounts', () => {
      expect(kesToUsd(100000)).toBe('769.23')
    })
  })

  describe('getApprovalUrl', () => {
    test('returns approve link URL', () => {
      const order: PayPalOrder = {
        id: 'PP-123',
        status: 'CREATED',
        links: [
          {
            href: 'https://api.sandbox.paypal.com/v2/checkout/orders/PP-123',
            rel: 'self',
            method: 'GET',
          },
          {
            href: 'https://www.sandbox.paypal.com/checkoutnow?token=PP-123',
            rel: 'approve',
            method: 'GET',
          },
          {
            href: 'https://api.sandbox.paypal.com/v2/checkout/orders/PP-123/capture',
            rel: 'capture',
            method: 'POST',
          },
        ],
      }
      expect(getApprovalUrl(order)).toBe(
        'https://www.sandbox.paypal.com/checkoutnow?token=PP-123'
      )
    })

    test('returns null when no approve link', () => {
      const order: PayPalOrder = {
        id: 'PP-456',
        status: 'CREATED',
        links: [
          {
            href: 'https://api.sandbox.paypal.com/v2/checkout/orders/PP-456',
            rel: 'self',
            method: 'GET',
          },
        ],
      }
      expect(getApprovalUrl(order)).toBeNull()
    })
  })
})

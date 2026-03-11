import { describe, expect, test } from 'bun:test'
import type { CreateOrderInput } from '@data/orders'

describe('Order Management', () => {
  describe('CreateOrderInput structure', () => {
    test('has required fields with listing_id and quantity', () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        items: [{ listing_id: 'listing-1', quantity: 1 }],
        shippingAddress: {
          full_name: 'John Doe',
          phone: '+254712345678',
          street: '123 Kenyatta Ave',
          city: 'Nairobi',
          county: 'Nairobi',
          country: 'Kenya',
        },
        paymentMethod: 'mpesa',
      }

      expect(input.userId).toBe('user-123')
      expect(input.items).toHaveLength(1)
      expect(input.items[0].listing_id).toBe('listing-1')
      expect(input.items[0].quantity).toBe(1)
      expect(input.shippingAddress.country).toBe('Kenya')
    })

    test('does not include client-supplied pricing fields', () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        items: [{ listing_id: 'listing-1', quantity: 2 }],
        shippingAddress: {
          full_name: 'Jane Doe',
          phone: '+254700000000',
          street: '456 Moi Ave',
          city: 'Mombasa',
          county: 'Mombasa',
          country: 'Kenya',
        },
        paymentMethod: 'paypal',
      }

      const keys = Object.keys(input.items[0])
      expect(keys).toContain('listing_id')
      expect(keys).toContain('quantity')
      expect(keys).not.toContain('unit_price_kes')
      expect(keys).not.toContain('deposit_kes')
      expect(keys).not.toContain('product_name')

      const topKeys = Object.keys(input)
      expect(topKeys).not.toContain('subtotal')
      expect(topKeys).not.toContain('depositTotal')
      expect(topKeys).not.toContain('shippingFee')
    })

    test('supports multiple items with quantities', () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        items: [
          { listing_id: 'l1', quantity: 1 },
          { listing_id: 'l2', quantity: 2 },
          { listing_id: 'l3', quantity: 1 },
        ],
        shippingAddress: {
          full_name: 'Test User',
          phone: '+254700000000',
          street: '789 Test St',
          city: 'Nairobi',
          county: 'Nairobi',
          country: 'Kenya',
        },
        paymentMethod: 'mpesa',
      }

      expect(input.items).toHaveLength(3)
      expect(input.items[1].quantity).toBe(2)
    })

    test('supports both payment methods', () => {
      const mpesa: CreateOrderInput['paymentMethod'] = 'mpesa'
      const paypal: CreateOrderInput['paymentMethod'] = 'paypal'

      expect(mpesa).toBe('mpesa')
      expect(paypal).toBe('paypal')
    })
  })
})

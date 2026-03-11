import { describe, expect, test } from 'bun:test'
import type { CreateOrderInput } from '@data/orders'

describe('Order Management', () => {
  describe('CreateOrderInput structure', () => {
    test('has required fields', () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        items: [
          {
            listing_id: 'listing-1',
            product_name: 'iPhone 12',
            unit_price_kes: 50000,
            deposit_kes: 2500,
          },
        ],
        subtotal: 50000,
        depositTotal: 2500,
        shippingFee: 0,
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
      expect(input.subtotal).toBe(50000)
      expect(input.shippingAddress.country).toBe('Kenya')
    })

    test('calculates balance correctly', () => {
      const subtotal = 80000
      const shippingFee = 500
      const depositTotal = 8000
      const total = subtotal + shippingFee
      const balanceDue = total - depositTotal

      expect(total).toBe(80500)
      expect(balanceDue).toBe(72500)
    })

    test('supports multiple items', () => {
      const items = [
        {
          listing_id: 'l1',
          product_name: 'iPhone 12',
          unit_price_kes: 30000,
          deposit_kes: 1500,
        },
        {
          listing_id: 'l2',
          product_name: 'iPhone 13',
          unit_price_kes: 50000,
          deposit_kes: 2500,
        },
        {
          listing_id: 'l3',
          product_name: 'iPhone 14',
          unit_price_kes: 80000,
          deposit_kes: 8000,
        },
      ]

      const subtotal = items.reduce((sum, i) => sum + i.unit_price_kes, 0)
      const depositTotal = items.reduce((sum, i) => sum + i.deposit_kes, 0)

      expect(subtotal).toBe(160000)
      expect(depositTotal).toBe(12000)
    })

    test('supports both payment methods', () => {
      const mpesa: CreateOrderInput['paymentMethod'] = 'mpesa'
      const paypal: CreateOrderInput['paymentMethod'] = 'paypal'

      expect(mpesa).toBe('mpesa')
      expect(paypal).toBe('paypal')
    })
  })
})

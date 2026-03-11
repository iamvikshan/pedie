import { describe, expect, test } from 'bun:test'
import {
  welcomeEmail,
  orderConfirmationEmail,
  paymentConfirmationEmail,
  shippingUpdateEmail,
  deliveryConfirmationEmail,
  orderCancelledEmail,
} from '@lib/email/templates'

describe('welcomeEmail', () => {
  test('returns subject containing Welcome and html containing userName', () => {
    const result = welcomeEmail('Alice')
    expect(result.subject).toContain('Welcome')
    expect(result.html).toContain('Alice')
  })

  test('sanitizes XSS in userName', () => {
    const result = welcomeEmail('<script>alert(1)</script>')
    expect(result.html).not.toContain('<script>')
  })
})

describe('orderConfirmationEmail', () => {
  const data = {
    userName: 'Bob',
    orderId: 'ORD-100',
    items: [
      { name: 'Widget', price: 1000 },
      { name: 'Gadget', price: 2000 },
    ],
    total: 3000,
    depositAmount: 500,
    paymentMethod: 'mpesa',
  }

  test('returns subject containing orderId, html containing userName and item names', () => {
    const result = orderConfirmationEmail(data)
    expect(result.subject).toContain('ORD-100')
    expect(result.html).toContain('Bob')
    expect(result.html).toContain('Widget')
    expect(result.html).toContain('Gadget')
  })

  test('sanitizes XSS in item name', () => {
    const result = orderConfirmationEmail({
      ...data,
      items: [{ name: '<img src=x onerror=alert(1)>', price: 500 }],
    })
    expect(result.html).not.toContain('<img')
  })
})

describe('paymentConfirmationEmail', () => {
  const data = {
    userName: 'Carol',
    orderId: 'ORD-200',
    amount: 5000,
    paymentMethod: 'paypal',
    receiptNumber: 'RCP-99',
  }

  test('returns subject containing orderId, html containing receiptNumber', () => {
    const result = paymentConfirmationEmail(data)
    expect(result.subject).toContain('ORD-200')
    expect(result.html).toContain('RCP-99')
  })

  test('sanitizes XSS in receiptNumber', () => {
    const result = paymentConfirmationEmail({
      ...data,
      receiptNumber: '"><script>steal()</script>',
    })
    expect(result.html).not.toContain('<script>')
  })
})

describe('shippingUpdateEmail', () => {
  test('returns subject containing orderId', () => {
    const result = shippingUpdateEmail({
      userName: 'Dan',
      orderId: 'ORD-300',
    })
    expect(result.subject).toContain('ORD-300')
  })
})

describe('deliveryConfirmationEmail', () => {
  test('returns subject containing orderId', () => {
    const result = deliveryConfirmationEmail({
      userName: 'Eve',
      orderId: 'ORD-400',
    })
    expect(result.subject).toContain('ORD-400')
  })
})

describe('orderCancelledEmail', () => {
  test('returns subject containing orderId', () => {
    const result = orderCancelledEmail({
      userName: 'Frank',
      orderId: 'ORD-500',
    })
    expect(result.subject).toContain('ORD-500')
  })
})

describe('all templates', () => {
  const templates = [
    { name: 'welcomeEmail', fn: () => welcomeEmail('Test') },
    {
      name: 'orderConfirmationEmail',
      fn: () =>
        orderConfirmationEmail({
          userName: 'Test',
          orderId: 'ORD-1',
          items: [{ name: 'Item', price: 100 }],
          total: 100,
          depositAmount: 10,
          paymentMethod: 'cash',
        }),
    },
    {
      name: 'paymentConfirmationEmail',
      fn: () =>
        paymentConfirmationEmail({
          userName: 'Test',
          orderId: 'ORD-1',
          amount: 100,
          paymentMethod: 'cash',
          receiptNumber: 'RCP-1',
        }),
    },
    {
      name: 'shippingUpdateEmail',
      fn: () => shippingUpdateEmail({ userName: 'Test', orderId: 'ORD-1' }),
    },
    {
      name: 'deliveryConfirmationEmail',
      fn: () =>
        deliveryConfirmationEmail({ userName: 'Test', orderId: 'ORD-1' }),
    },
    {
      name: 'orderCancelledEmail',
      fn: () => orderCancelledEmail({ userName: 'Test', orderId: 'ORD-1' }),
    },
  ]

  for (const { name, fn } of templates) {
    test(`${name} returns valid HTML starting with DOCTYPE`, () => {
      const result = fn()
      expect(result.html).toMatch(/^<!DOCTYPE html>/)
    })
  }
})

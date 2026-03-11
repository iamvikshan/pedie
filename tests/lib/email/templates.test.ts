import { describe, expect, test } from 'bun:test'
import {
  orderConfirmationEmail,
  paymentConfirmationEmail,
  welcomeEmail,
} from '@lib/email/templates'

describe('welcomeEmail', () => {
  test('returns correct subject', () => {
    const result = welcomeEmail('John')
    expect(result.subject).toBe('Welcome to Pedie Tech!')
  })

  test('includes user name in HTML', () => {
    const result = welcomeEmail('Alice')
    expect(result.html).toContain('Alice')
  })

  test('includes Pedie Tech branding', () => {
    const result = welcomeEmail('Bob')
    expect(result.html).toContain('Pedie Tech')
    expect(result.html).toContain('#22c55e')
  })

  test('includes support footer', () => {
    const result = welcomeEmail('User')
    expect(result.html).toContain('support@pedietech.com')
  })

  test('returns valid HTML', () => {
    const result = welcomeEmail('Test')
    expect(result.html).toContain('<html')
    expect(result.html).toContain('</html>')
  })
})

describe('orderConfirmationEmail', () => {
  const data = {
    userName: 'Jane',
    orderId: 'ORD-001',
    items: [
      { name: 'Phone Case', price: 1500 },
      { name: 'Screen Protector', price: 500 },
    ],
    total: 2000,
    depositAmount: 500,
    paymentMethod: 'mpesa',
  }

  test('returns correct subject with order ID', () => {
    const result = orderConfirmationEmail(data)
    expect(result.subject).toContain('ORD-001')
  })

  test('includes user name', () => {
    const result = orderConfirmationEmail(data)
    expect(result.html).toContain('Jane')
  })

  test('includes order ID', () => {
    const result = orderConfirmationEmail(data)
    expect(result.html).toContain('ORD-001')
  })

  test('includes item names', () => {
    const result = orderConfirmationEmail(data)
    expect(result.html).toContain('Phone Case')
    expect(result.html).toContain('Screen Protector')
  })

  test('includes total amount', () => {
    const result = orderConfirmationEmail(data)
    expect(result.html).toContain('2,000')
  })

  test('includes deposit amount', () => {
    const result = orderConfirmationEmail(data)
    expect(result.html).toContain('500')
  })

  test('includes payment method', () => {
    const result = orderConfirmationEmail(data)
    expect(result.html).toContain('mpesa')
  })

  test('includes Pedie Tech branding', () => {
    const result = orderConfirmationEmail(data)
    expect(result.html).toContain('Pedie Tech')
    expect(result.html).toContain('#22c55e')
  })
})

describe('paymentConfirmationEmail', () => {
  const data = {
    userName: 'John',
    orderId: 'ORD-002',
    amount: 3500,
    paymentMethod: 'paypal',
    receiptNumber: 'RCP-12345',
  }

  test('returns correct subject', () => {
    const result = paymentConfirmationEmail(data)
    expect(result.subject).toContain('Payment')
  })

  test('includes user name', () => {
    const result = paymentConfirmationEmail(data)
    expect(result.html).toContain('John')
  })

  test('includes order ID', () => {
    const result = paymentConfirmationEmail(data)
    expect(result.html).toContain('ORD-002')
  })

  test('includes amount', () => {
    const result = paymentConfirmationEmail(data)
    expect(result.html).toContain('3,500')
  })

  test('includes payment method', () => {
    const result = paymentConfirmationEmail(data)
    expect(result.html).toContain('paypal')
  })

  test('includes receipt number', () => {
    const result = paymentConfirmationEmail(data)
    expect(result.html).toContain('RCP-12345')
  })

  test('includes Pedie Tech branding', () => {
    const result = paymentConfirmationEmail(data)
    expect(result.html).toContain('Pedie Tech')
    expect(result.html).toContain('#22c55e')
  })

  test('strips HTML tags from user-provided values', () => {
    const result = paymentConfirmationEmail({
      userName: '<script>alert("xss")</script>',
      orderId: 'ORD-<img onerror=alert(1)>',
      amount: 3500,
      paymentMethod: '"><script>',
      receiptNumber: "rcpt'&hack",
    })
    expect(result.html).not.toContain('<script>')
    expect(result.html).not.toContain('<img')
    expect(result.html).not.toContain('onerror')
    expect(result.html).toContain('&amp;hack')
  })
})

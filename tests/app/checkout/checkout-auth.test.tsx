import { beforeEach, describe, expect, mock, test } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockPush = mock(() => {})
const mockUseAuth = mock(() => ({
  user: null as any,
  loading: false,
}))

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: mock(() => '/checkout'),
  useSearchParams: mock(() => new URLSearchParams()),
  redirect: mock(() => {
    throw new Error('NEXT_REDIRECT')
  }),
  notFound: mock(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

mock.module('@components/auth/authProvider', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}))

mock.module('@lib/cart/store', () => ({
  useCartStore: (selector: (s: any) => any) =>
    selector({
      items: [],
      getTotal: () => 0,
      getDepositTotal: () => 0,
      clearCart: mock(() => {}),
    }),
}))

mock.module('@helpers', () => ({
  formatKes: mock((amount: number) => `KES ${amount.toLocaleString('en-KE')}`),
  calculateDeposit: mock((price: number) => Math.round(price * 0.05)),
  KES_USD_RATE: 130,
}))

mock.module('@components/checkout/checkoutSteps', () => ({
  CheckoutSteps: mock(() =>
    React.createElement('div', { 'data-testid': 'checkout-steps' })
  ),
}))

mock.module('@components/checkout/shippingForm', () => ({
  ShippingForm: mock(() =>
    React.createElement('div', { 'data-testid': 'shipping-form' })
  ),
}))

mock.module('@components/checkout/paymentSelector', () => ({
  PaymentSelector: mock(() =>
    React.createElement('div', { 'data-testid': 'payment-selector' })
  ),
}))

mock.module('@components/checkout/mpesaPayment', () => ({
  MpesaPayment: mock(() =>
    React.createElement('div', { 'data-testid': 'mpesa-payment' })
  ),
}))

mock.module('@components/checkout/paypalPayment', () => ({
  PaypalPayment: mock(() =>
    React.createElement('div', { 'data-testid': 'paypal-payment' })
  ),
}))

mock.module('@components/ui/button', () => ({
  Button: mock(({ children, ...props }: any) =>
    React.createElement('button', props, children)
  ),
}))

// Import AFTER mocking
const { default: CheckoutPage } = await import('@/app/(store)/checkout/page')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('CheckoutPage (auth gate)', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockUseAuth.mockReset()
  })

  test('redirects to signin when not authenticated and not loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })

    const html = renderToString(React.createElement(CheckoutPage))
    expect(html).toContain('Redirecting to sign in')
  })

  test('shows checkout content when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      loading: false,
    })

    const html = renderToString(React.createElement(CheckoutPage))
    // When authenticated with empty cart, shows empty cart message
    expect(html).toContain('Your cart is empty')
  })
})

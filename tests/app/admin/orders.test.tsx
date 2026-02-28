import { describe, test, expect, mock } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockOrders = {
  data: [
    {
      id: 'order-uuid-1234-abcd',
      user_id: 'user-1',
      profile: { full_name: 'Alice Smith' },
      status: 'pending',
      payment_method: 'mpesa',
      total_kes: 85000,
      created_at: '2025-06-01T10:00:00Z',
    },
    {
      id: 'order-uuid-5678-efgh',
      user_id: 'user-2',
      profile: { full_name: 'Bob Jones' },
      status: 'shipped',
      payment_method: 'paypal',
      total_kes: 65000,
      created_at: '2025-06-02T10:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  totalPages: 1,
}

mock.module('@lib/data/admin', () => ({
  getAdminOrders: mock(() => Promise.resolve(mockOrders)),
  getAdminOrderDetail: mock(() =>
    Promise.resolve({
      order: {
        id: 'order-uuid-1234-abcd',
        user_id: 'user-1',
        status: 'pending',
        payment_method: 'mpesa',
        subtotal_kes: 80000,
        total_kes: 85000,
        shipping_fee_kes: 5000,
        deposit_amount_kes: 4000,
        balance_due_kes: 81000,
        shipping_address: { full_name: 'Alice', address: '123 Main St', city: 'Nairobi', phone: '+254700000000' },
        tracking_info: null,
        notes: null,
        payment_ref: 'REF-123',
        created_at: '2025-06-01T10:00:00Z',
      },
      items: [
        {
          id: 'item-1',
          listing_id: 'lst-1',
          unit_price_kes: 80000,
          deposit_kes: 4000,
          listing: {
            listing_id: 'PD-ABC12',
            product: { brand: 'Apple', model: 'iPhone 15' },
          },
        },
      ],
      customer: { id: 'user-1', full_name: 'Alice Smith', phone: '+254700000000' },
    })
  ),
}))

mock.module('next/link', () => ({
  default: mock(({ children, href, ...props }: Record<string, unknown>) =>
    React.createElement(
      'a',
      { href: href as string, ...props },
      children as React.ReactNode
    )
  ),
}))

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mock(), refresh: mock() }),
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
}))

// Import AFTER mocking
const { orderColumns } = await import('@/app/(admin)/admin/orders/columns')
const { OrderStatusUpdater } = await import(
  '@components/admin/orderStatusUpdater'
)
const { TrackingForm } = await import('@components/admin/trackingForm')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Admin Orders', () => {
  describe('Order Columns', () => {
    test('defines expected columns', () => {
      const columnIds = orderColumns.map(
        (col: any) => col.accessorKey || col.id
      )
      expect(columnIds).toContain('id')
      expect(columnIds).toContain('customer')
      expect(columnIds).toContain('status')
      expect(columnIds).toContain('payment_method')
      expect(columnIds).toContain('total_kes')
      expect(columnIds).toContain('created_at')
      expect(columnIds).toContain('actions')
    })

    test('has correct number of columns', () => {
      expect(orderColumns.length).toBe(7)
    })
  })

  describe('OrderStatusUpdater', () => {
    test('renders status dropdown and update button', () => {
      const html = renderToString(
        React.createElement(OrderStatusUpdater, {
          orderId: 'order-1',
          currentStatus: 'pending',
        })
      )

      expect(html).toContain('Update Status')
      expect(html).toContain('select')
      expect(html).toContain('Pending')
      expect(html).toContain('Shipped')
      expect(html).toContain('Delivered')
      expect(html).toContain('Cancelled')
    })
  })

  describe('TrackingForm', () => {
    test('renders tracking form fields', () => {
      const html = renderToString(
        React.createElement(TrackingForm, {
          orderId: 'order-1',
          initialTracking: null,
          initialNotes: null,
        })
      )

      expect(html).toContain('Tracking Information')
      expect(html).toContain('Carrier')
      expect(html).toContain('Tracking Number')
      expect(html).toContain('Estimated Delivery')
      expect(html).toContain('Notes')
      expect(html).toContain('Save Tracking')
    })

    test('pre-fills tracking data', () => {
      const html = renderToString(
        React.createElement(TrackingForm, {
          orderId: 'order-1',
          initialTracking: {
            carrier: 'DHL',
            tracking_number: 'DHL-123456',
            estimated_delivery: '2025-07-01',
          },
          initialNotes: 'Handle with care',
        })
      )

      expect(html).toContain('DHL')
      expect(html).toContain('DHL-123456')
      expect(html).toContain('Handle with care')
    })
  })
})

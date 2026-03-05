import { describe, expect, mock, test } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

mock.module('@data/admin', () => ({
  getAdminCustomers: mock(() =>
    Promise.resolve({
      data: [
        {
          id: 'user-1',
          full_name: 'Alice Smith',
          role: 'customer',
          phone: '+254700000000',
          created_at: '2025-06-01T10:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    })
  ),
  getAdminCustomerDetail: mock(() =>
    Promise.resolve({
      profile: {
        id: 'user-1',
        full_name: 'Alice Smith',
        role: 'customer',
        phone: '+254700000000',
        created_at: '2025-06-01T10:00:00Z',
      },
      orders: [
        {
          id: 'order-1',
          status: 'pending',
          total_kes: 85000,
          created_at: '2025-06-15T10:00:00Z',
        },
      ],
      wishlist: [],
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
const { customerColumns } =
  await import('@/app/(admin)/admin/customers/columns')
const { CustomerRoleSwitcher } =
  await import('@components/admin/customerRoleSwitcher')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Admin Customers', () => {
  describe('Customer Columns', () => {
    test('defines expected columns', () => {
      const columnIds = customerColumns.map(
        (col: any) => col.accessorKey || col.id
      )
      expect(columnIds).toContain('full_name')
      expect(columnIds).toContain('id')
      expect(columnIds).toContain('role')
      expect(columnIds).toContain('phone')
      expect(columnIds).toContain('created_at')
      expect(columnIds).toContain('actions')
    })

    test('has correct number of columns', () => {
      expect(customerColumns.length).toBe(6)
    })
  })

  describe('CustomerRoleSwitcher', () => {
    test('renders role dropdown and update button', () => {
      const html = renderToString(
        React.createElement(CustomerRoleSwitcher, {
          customerId: 'user-1',
          currentRole: 'customer',
        })
      )

      expect(html).toContain('Role Management')
      expect(html).toContain('select')
      expect(html).toContain('Customer')
      expect(html).toContain('Admin')
      expect(html).toContain('Update Role')
    })
  })
})

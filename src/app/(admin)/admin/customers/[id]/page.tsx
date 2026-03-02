import { CustomerRoleSwitcher } from '@components/admin/customerRoleSwitcher'
import { formatKes } from '@helpers'
import { getAdminCustomerDetail } from '@lib/data/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { profile, orders } = await getAdminCustomerDetail(id)

  if (!profile) {
    notFound()
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold text-pedie-text'>
        Customer: {(profile.full_name as string) ?? 'Unknown'}
      </h2>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Profile Info */}
        <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
          <h3 className='mb-3 font-medium text-pedie-text'>Profile</h3>
          <dl className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Name</dt>
              <dd className='text-pedie-text'>
                {(profile.full_name as string) ?? '—'}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Phone</dt>
              <dd className='text-pedie-text'>
                {(profile.phone as string) ?? '—'}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Role</dt>
              <dd className='capitalize text-pedie-text'>
                {(profile.role as string) ?? 'customer'}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-pedie-muted'>Joined</dt>
              <dd className='text-pedie-text'>
                {profile.created_at
                  ? new Date(profile.created_at as string).toLocaleDateString()
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Role Switcher */}
        <CustomerRoleSwitcher
          customerId={profile.id as string}
          currentRole={(profile.role as string) ?? 'customer'}
        />
      </div>

      {/* Recent Orders */}
      <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
        <h3 className='mb-3 font-medium text-pedie-text'>Recent Orders</h3>
        {orders.length === 0 ? (
          <p className='text-sm text-pedie-muted'>No orders yet.</p>
        ) : (
          <table className='w-full text-left text-sm'>
            <thead>
              <tr className='border-b border-pedie-border'>
                <th className='px-2 py-2 font-medium text-pedie-muted'>
                  Order ID
                </th>
                <th className='px-2 py-2 font-medium text-pedie-muted'>
                  Status
                </th>
                <th className='px-2 py-2 text-right font-medium text-pedie-muted'>
                  Total
                </th>
                <th className='px-2 py-2 font-medium text-pedie-muted'>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map(order => (
                <tr
                  key={order.id as string}
                  className='border-b border-pedie-border last:border-0'
                >
                  <td className='px-2 py-2'>
                    <Link
                      href={`/admin/orders/${order.id as string}`}
                      className='font-mono text-xs text-pedie-primary hover:underline'
                    >
                      {(order.id as string).slice(0, 8)}…
                    </Link>
                  </td>
                  <td className='px-2 py-2 capitalize text-pedie-text'>
                    {(order.status as string) ?? 'pending'}
                  </td>
                  <td className='px-2 py-2 text-right text-pedie-text'>
                    {formatKes(order.total_kes as number)}
                  </td>
                  <td className='px-2 py-2 text-pedie-text'>
                    {order.created_at
                      ? new Date(
                          order.created_at as string
                        ).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

import Link from 'next/link'
import { requireAuth } from '@lib/auth/helpers'
import { getProfile } from '@lib/auth/helpers'
import { getOrdersByUser } from '@lib/data/orders'
import { Button } from '@components/ui/button'

export default async function AccountDashboard() {
  const user = await requireAuth()
  const profile = await getProfile()
  const orders = await getOrdersByUser(user!.id)

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
      })
    : 'N/A'

  return (
    <div className='space-y-6'>
      {/* Welcome */}
      <div className='rounded-lg border border-pedie-border bg-pedie-card p-6'>
        <h1 className='text-2xl font-bold text-pedie-text'>
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className='mt-1 text-sm text-pedie-text-muted'>
          Member since {memberSince}
        </p>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
          <p className='text-sm text-pedie-text-muted'>Total Orders</p>
          <p className='mt-1 text-2xl font-bold text-pedie-text'>
            {orders.length}
          </p>
        </div>
        <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
          <p className='text-sm text-pedie-text-muted'>Member Since</p>
          <p className='mt-1 text-lg font-medium text-pedie-text'>
            {memberSince}
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Link
          href='/account/orders'
          className='rounded-lg border border-pedie-border bg-pedie-card p-4 transition-colors hover:bg-pedie-card-hover'
        >
          <h3 className='font-medium text-pedie-text'>My Orders</h3>
          <p className='mt-1 text-sm text-pedie-text-muted'>
            View and track your orders
          </p>
        </Link>
        <Link
          href='/account/wishlist'
          className='rounded-lg border border-pedie-border bg-pedie-card p-4 transition-colors hover:bg-pedie-card-hover'
        >
          <h3 className='font-medium text-pedie-text'>Wishlist</h3>
          <p className='mt-1 text-sm text-pedie-text-muted'>
            Items you&apos;ve saved for later
          </p>
        </Link>
      </div>

      {/* Admin Link */}
      {profile?.role === 'admin' && (
        <Link href='/admin'>
          <Button variant='secondary' className='w-full sm:w-auto'>
            Admin Dashboard
          </Button>
        </Link>
      )}
    </div>
  )
}

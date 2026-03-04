import { KpiCards } from '@components/admin/kpiCards'
import { RecentOrders } from '@components/admin/recentOrders'
import { RevenueChart } from '@components/admin/revenueChart'
import {
  getAdminDashboardStats,
  getAdminOrders,
  getRevenueData,
} from '@data/admin'

export default async function AdminDashboardPage() {
  const [statsResult, revenueResult, ordersResult] = await Promise.allSettled([
    getAdminDashboardStats(),
    getRevenueData(30),
    getAdminOrders({ limit: 10 }),
  ])

  const stats =
    statsResult.status === 'fulfilled'
      ? statsResult.value
      : {
          totalRevenue: 0,
          ordersToday: 0,
          pendingOrders: 0,
          activeListings: 0,
          totalCustomers: 0,
        }
  const revenueData =
    revenueResult.status === 'fulfilled' ? revenueResult.value : []
  const recentOrders =
    ordersResult.status === 'fulfilled' ? ordersResult.value : { data: [] }

  return (
    <div className='space-y-6'>
      <KpiCards stats={stats} />
      <RevenueChart data={revenueData} />
      <RecentOrders orders={recentOrders.data} />
    </div>
  )
}

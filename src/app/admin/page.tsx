import {
  getAdminDashboardStats,
  getRevenueData,
  getAdminOrders,
} from '@lib/data/admin'
import { KpiCards } from '@components/admin/kpi-cards'
import { RevenueChart } from '@components/admin/revenue-chart'
import { RecentOrders } from '@components/admin/recent-orders'

export default async function AdminDashboardPage() {
  const [stats, revenueData, recentOrders] = await Promise.all([
    getAdminDashboardStats(),
    getRevenueData(30),
    getAdminOrders({ limit: 10 }),
  ])

  return (
    <div className='space-y-6'>
      <KpiCards stats={stats} />
      <RevenueChart data={revenueData} />
      <RecentOrders orders={recentOrders.data} />
    </div>
  )
}

import { formatKes } from '@lib/constants'
import type { AdminDashboardStats } from '@lib/data/admin'

interface KpiCardsProps {
  stats: AdminDashboardStats
}

const kpiConfig = [
  {
    key: 'totalRevenue' as const,
    label: 'Total Revenue',
    icon: '💰',
    format: (v: number) => formatKes(v),
  },
  {
    key: 'ordersToday' as const,
    label: 'Orders Today',
    icon: '📦',
    format: (v: number) => v.toString(),
  },
  {
    key: 'pendingOrders' as const,
    label: 'Pending Orders',
    icon: '⏳',
    format: (v: number) => v.toString(),
  },
  {
    key: 'activeListings' as const,
    label: 'Active Listings',
    icon: '🏷️',
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalCustomers' as const,
    label: 'Total Customers',
    icon: '👥',
    format: (v: number) => v.toString(),
  },
]

export function KpiCards({ stats }: KpiCardsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
      {kpiConfig.map(kpi => (
        <div
          key={kpi.key}
          className='rounded-lg border border-pedie-border bg-pedie-card p-4'
        >
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>{kpi.icon}</span>
            <span className='text-sm text-pedie-muted'>{kpi.label}</span>
          </div>
          <p className='mt-2 text-2xl font-bold text-pedie-text'>
            {kpi.format(stats[kpi.key] ?? 0)}
          </p>
        </div>
      ))}
    </div>
  )
}

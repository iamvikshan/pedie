import { formatKes } from '@helpers'
import type { AdminDashboardStats } from '@data/admin'
import type { IconType } from 'react-icons'
import {
  TbClockHour4,
  TbCoins,
  TbPackage,
  TbTags,
  TbUsers,
} from 'react-icons/tb'

interface KpiCardsProps {
  stats: AdminDashboardStats
}

const kpiConfig: {
  key: keyof AdminDashboardStats
  label: string
  icon: IconType
  format: (v: number) => string
}[] = [
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: TbCoins,
    format: (v: number) => formatKes(v),
  },
  {
    key: 'ordersToday',
    label: 'Orders Today',
    icon: TbPackage,
    format: (v: number) => v.toString(),
  },
  {
    key: 'pendingOrders',
    label: 'Pending Orders',
    icon: TbClockHour4,
    format: (v: number) => v.toString(),
  },
  {
    key: 'activeListings',
    label: 'Active Listings',
    icon: TbTags,
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalCustomers',
    label: 'Total Customers',
    icon: TbUsers,
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
            <kpi.icon
              className='size-6 text-pedie-text-muted'
              aria-hidden='true'
            />
            <span className='text-sm text-pedie-text-muted'>{kpi.label}</span>
          </div>
          <p className='mt-2 text-2xl font-bold text-pedie-text'>
            {kpi.format(stats[kpi.key] ?? 0)}
          </p>
        </div>
      ))}
    </div>
  )
}

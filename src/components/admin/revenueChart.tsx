'use client'

import type { RevenueDataPoint } from '@lib/data/admin'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface RevenueChartProps {
  data: RevenueDataPoint[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
      <h2 className='mb-4 text-lg font-semibold text-pedie-text'>
        Revenue (Last 30 Days)
      </h2>
      <div className='h-72 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tickFormatter={v =>
                new Date(v).toLocaleDateString('en-KE', {
                  timeZone: 'Africa/Nairobi',
                  month: 'numeric',
                  day: 'numeric',
                })
              }
              fontSize={12}
            />
            <YAxis
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              fontSize={12}
            />
            <Tooltip
              formatter={value => [
                `KES ${Number(value).toLocaleString()}`,
                'Revenue',
              ]}
              labelFormatter={label => `Date: ${label}`}
            />
            <Area
              type='monotone'
              dataKey='revenue'
              stroke='#3b82f6'
              fill='#3b82f6'
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

import { TbBolt } from 'react-icons/tb'

export const BATTERY_THRESHOLDS = { good: 80, warning: 50 } as const

/** Returns the Tailwind color class for a given battery health percentage. */
export function getBatteryColor(health: number): string {
  if (health >= BATTERY_THRESHOLDS.good) return 'text-pedie-badge-excellent'
  if (health >= BATTERY_THRESHOLDS.warning) return 'text-amber-400'
  return 'text-pedie-discount'
}

interface BatteryBadgeProps {
  batteryHealth: number
  className?: string
}

/** Glassmorphed pill showing battery health with color-coded icon. */
export function BatteryBadge({
  batteryHealth,
  className = '',
}: BatteryBadgeProps) {
  return (
    <span
      className={`glass backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium inline-flex items-center gap-0.5 ${getBatteryColor(batteryHealth)} ${className}`}
    >
      <TbBolt className='w-3 h-3' aria-hidden='true' />
      {batteryHealth}%
    </span>
  )
}

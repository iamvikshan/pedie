import { formatKes } from '@helpers'

interface PreorderBadgeProps {
  isPreorder: boolean
  depositAmount: number
}

export function PreorderBadge({
  isPreorder,
  depositAmount,
}: PreorderBadgeProps) {
  if (!isPreorder) {
    return null
  }

  return (
    <div className='rounded-md bg-pedie-green/10 border border-pedie-green/30 px-4 py-3'>
      <span className='text-sm font-medium text-pedie-green'>
        Preorder — Deposit: {formatKes(depositAmount)}
      </span>
    </div>
  )
}

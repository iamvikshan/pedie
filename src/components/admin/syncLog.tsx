import { Badge } from '@components/ui/badge'

interface SyncLogEntry {
  id: string
  triggered_by: string
  status: string
  rows_synced: number | null
  errors: unknown | null
  started_at: string
  completed_at: string | null
}

interface SyncLogProps {
  logs: SyncLogEntry[]
}

const statusVariants: Record<
  string,
  'success' | 'warning' | 'error' | 'default'
> = {
  success: 'success',
  partial: 'warning',
  error: 'error',
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return '—'
  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt).getTime()
  const seconds = Math.round((end - start) / 1000)
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

function countErrors(errors: unknown): number {
  if (Array.isArray(errors)) return errors.length
  return 0
}

const dateFormatter = new Intl.DateTimeFormat('en-KE', {
  timeZone: 'Africa/Nairobi',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function SyncLog({ logs }: SyncLogProps) {
  if (logs.length === 0) {
    return (
      <div className='rounded-lg border border-pedie-border bg-pedie-card p-4'>
        <p className='text-sm text-pedie-text-muted'>No sync history yet.</p>
      </div>
    )
  }

  return (
    <div className='rounded-lg border border-pedie-border bg-pedie-card'>
      <table className='w-full text-left text-sm'>
        <thead>
          <tr className='border-b border-pedie-border bg-pedie-card'>
            <th className='px-4 py-3 font-medium text-pedie-text-muted'>
              Triggered By
            </th>
            <th className='px-4 py-3 font-medium text-pedie-text-muted'>
              Status
            </th>
            <th className='px-4 py-3 font-medium text-pedie-text-muted'>
              Rows Synced
            </th>
            <th className='px-4 py-3 font-medium text-pedie-text-muted'>
              Errors
            </th>
            <th className='px-4 py-3 font-medium text-pedie-text-muted'>
              Started At
            </th>
            <th className='px-4 py-3 font-medium text-pedie-text-muted'>
              Duration
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr
              key={log.id}
              className='border-b border-pedie-border last:border-0'
            >
              <td className='px-4 py-3 font-mono text-xs text-pedie-text'>
                {log.triggered_by.slice(0, 8)}…
              </td>
              <td className='px-4 py-3'>
                <Badge
                  variant={statusVariants[log.status] ?? 'default'}
                  size='sm'
                  className='capitalize'
                >
                  {log.status}
                </Badge>
              </td>
              <td className='px-4 py-3 text-pedie-text'>
                {log.rows_synced ?? 0}
              </td>
              <td className='px-4 py-3 text-pedie-text'>
                {countErrors(log.errors)}
              </td>
              <td className='px-4 py-3 text-pedie-text'>
                {dateFormatter.format(new Date(log.started_at))}
              </td>
              <td className='px-4 py-3 text-pedie-text'>
                {formatDuration(log.started_at, log.completed_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

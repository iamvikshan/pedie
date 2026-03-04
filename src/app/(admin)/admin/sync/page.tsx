import { SyncLog } from '@components/admin/syncLog'
import { SyncStatus } from '@components/admin/syncStatus'
import { getSyncHistory } from '@data/admin'

export default async function AdminSyncPage() {
  const history = await getSyncHistory()

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold text-pedie-text'>
        Google Sheets Sync
      </h2>
      <SyncStatus />
      <div>
        <h3 className='mb-3 text-lg font-medium text-pedie-text'>
          Sync History
        </h3>
        <SyncLog
          logs={
            history as Array<{
              id: string
              triggered_by: string
              status: string
              rows_synced: number | null
              errors: unknown | null
              started_at: string
              completed_at: string | null
            }>
          }
        />
      </div>
    </div>
  )
}

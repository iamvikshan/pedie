import { createAdminClient } from '@lib/supabase/admin'
import type { Json } from '@app-types/database'

/** Fire-and-forget audit log entry for admin actions. Never throws. */
export function logAdminEvent(
  actorId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  try {
    const supabase = createAdminClient()
    Promise.resolve(
      supabase.from('admin_log').insert({
        actor_id: actorId,
        action,
        entity_type: entityType,
        entity_id: entityId ?? null,
        details: (details as Json) ?? null,
        triggered_by: 'admin',
        status: 'completed',
        rows_synced: 0,
      })
    )
      .then(({ error }) => {
        if (error) console.error('Audit log failed:', error.message)
      })
      .catch((err: unknown) => {
        console.error(
          'Audit log failed:',
          err instanceof Error ? err.message : err
        )
      })
  } catch (err) {
    console.error(
      'Audit log failed:',
      err instanceof Error ? (err as Error).message : err
    )
  }
}

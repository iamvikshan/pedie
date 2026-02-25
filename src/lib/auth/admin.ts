import { createAdminClient } from '@lib/supabase/admin'

/** Check if a user ID has admin role (server-side, uses service role) */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error(
      `Failed to check admin status for user ${userId}:`,
      error.message
    )
    return false
  }

  return data?.role === 'admin'
}

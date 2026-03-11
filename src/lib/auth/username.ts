import { createAdminClient } from '@lib/supabase/admin'

const USERNAME_REGEX = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/

export function isValidUsername(input: string): boolean {
  return input.length >= 3 && input.length <= 20 && USERNAME_REGEX.test(input)
}

export function isEmail(input: string): boolean {
  return input.includes('@')
}

export async function resolveUsername(
  username: string
): Promise<string | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('resolve_username', {
    input_username: username.toLowerCase(),
  })
  if (error || !data) return null
  return data as string
}

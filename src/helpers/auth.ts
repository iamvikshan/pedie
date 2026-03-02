import type { Profile } from '@app-types/user'
import { createClient } from '@lib/supabase/server'
import type { User } from '@supabase/supabase-js'

/** Get the current authenticated user, or null */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** Get the current user's profile, or null */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error(`Failed to fetch profile for user ${user.id}:`, error.message)
    return null
  }

  return data
}

/** Check if the current user is an admin */
export async function isAdmin(): Promise<boolean> {
  const profile = await getProfile()
  return profile?.role === 'admin'
}

/** Require authentication — returns user or redirects */
export async function requireAuth(): Promise<User> {
  const user = await getUser()
  if (!user) {
    const { redirect } = await import('next/navigation')
    redirect('/auth/signin')
  }
  return user!
}

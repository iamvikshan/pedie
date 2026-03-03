'use client'

import { createClient } from '@lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

interface AuthContextValue {
  user: User | null
  loading: boolean
  profile: {
    full_name: string | null
    avatar_url: string | null
    role: string | null
  } | null
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  profile: null,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthContextValue['profile']>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', userId)
        .single()
      if (error) {
        console.error('Failed to fetch profile:', error.message)
        return
      }
      setProfile(data)
    } catch (err) {
      console.error('Profile fetch error:', err)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth
      .getUser()
      .then(async ({ data: { user }, error }) => {
        if (error) {
          // console.error('Failed to get user:', error.message)
          setUser(null)
          setProfile(null)
          return
        }
        setUser(user)
        if (user) await fetchProfile(user.id)
      })
      .catch(err => {
        console.error('Auth getUser error:', err)
        setUser(null)
        setProfile(null)
      })
      .finally(() => {
        setLoading(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null
      setUser(newUser)
      if (newUser) {
        await fetchProfile(newUser.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  return (
    <AuthContext.Provider value={{ user, loading, profile }}>
      {children}
    </AuthContext.Provider>
  )
}

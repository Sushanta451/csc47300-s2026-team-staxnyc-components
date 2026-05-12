import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { getProfile } from './auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) { setProfile(null); return }
    getProfile(user.id).then(setProfile).catch((e) => {
      console.error('getProfile failed', e); setProfile(null)
    })
  }, [user])

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    refreshProfile: async () => {
      if (user) setProfile(await getProfile(user.id))
    },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// ── Owner account — always premium, no payment needed ────
const OWNER_EMAIL = 'muyanjaowen3@gmail.com'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isPremium: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshPlan: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<User | null>(null)
  const [session, setSession]     = useState<Session | null>(null)
  const [loading, setLoading]     = useState(true)
  const [isPremium, setIsPremium] = useState(false)

  // Check premium status from Supabase profiles table
  const checkPremium = async (u: User | null) => {
    if (!u) { setIsPremium(false); return }

    // Owner email is always premium — no DB needed
    if (u.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      setIsPremium(true)
      return
    }

    // Check Supabase subscriptions table
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('status, expires_at')
        .eq('user_id', u.id)
        .eq('status', 'active')
        .maybeSingle()

      if (data) {
        const notExpired = !data.expires_at || new Date(data.expires_at) > new Date()
        setIsPremium(notExpired)
      } else {
        setIsPremium(false)
      }
    } catch {
      setIsPremium(false)
    }
  }

  const refreshPlan = async () => { await checkPremium(user) }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      checkPremium(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      checkPremium(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error: error?.message ?? null }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setIsPremium(false)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isPremium, signUp, signIn, signOut, refreshPlan }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

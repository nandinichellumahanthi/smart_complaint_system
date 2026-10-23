import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from './api'
import type { User } from './types'

interface Ctx { user: User | null; loading: boolean; signIn: (token: string, u: User) => void; signOut: () => void }
const AuthCtx = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(!!localStorage.getItem('scs-token'))
  useEffect(() => {
    if (!localStorage.getItem('scs-token')) return
    api<User>('/auth/me').then(setUser).catch(() => localStorage.removeItem('scs-token')).finally(() => setLoading(false))
  }, [])
  const signIn = (token: string, u: User) => { localStorage.setItem('scs-token', token); setUser(u) }
  const signOut = () => { localStorage.removeItem('scs-token'); setUser(null) }
  return <AuthCtx.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const c = useContext(AuthCtx)
  if (!c) throw new Error('AuthProvider missing')
  return c
}

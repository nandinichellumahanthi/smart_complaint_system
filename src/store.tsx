import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export const CATEGORIES = ['Water', 'Electricity', 'Roads', 'Sanitation', 'Other'] as const
export const STATUSES = ['Pending', 'In Progress', 'Resolved'] as const
export type Category = (typeof CATEGORIES)[number]
export type Status = (typeof STATUSES)[number]
export interface Complaint {
  id: string; title: string; category: Category; description: string
  status: Status; owner: string; createdAt: string; note: string
}
export interface User { name: string; role: 'user' | 'admin' }

interface Ctx {
  user: User | null; complaints: Complaint[]
  login: (u: User) => void; logout: () => void
  add: (c: Pick<Complaint, 'title' | 'category' | 'description'>) => void
  update: (id: string, patch: Partial<Complaint>) => void
}

const SEED: Complaint[] = [
  { id: 'C-1001', title: 'Street light not working', category: 'Electricity', description: 'The light near the park gate has been off for a week.', status: 'In Progress', owner: 'Ravi', createdAt: '2026-10-12', note: 'Technician assigned.' },
  { id: 'C-1002', title: 'No water supply in the morning', category: 'Water', description: 'Taps run dry between 6 and 9 AM.', status: 'Pending', owner: 'Anita', createdAt: '2026-10-15', note: '' },
  { id: 'C-1003', title: 'Pothole on main road', category: 'Roads', description: 'Large pothole causing accidents near the bus stop.', status: 'Resolved', owner: 'Ravi', createdAt: '2026-10-05', note: 'Repaired on 10 Oct.' },
]

function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback } catch { return fallback }
}

const Store = createContext<Ctx | null>(null)

export function Provider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => read('scs-user', null))
  const [complaints, setComplaints] = useState<Complaint[]>(() => read('scs-complaints', SEED))
  useEffect(() => { localStorage.setItem('scs-user', JSON.stringify(user)) }, [user])
  useEffect(() => { localStorage.setItem('scs-complaints', JSON.stringify(complaints)) }, [complaints])

  const value: Ctx = {
    user, complaints,
    login: setUser,
    logout: () => setUser(null),
    add: (c) => setComplaints((list) => [{
      ...c, id: `C-${1001 + list.length}`, status: 'Pending', owner: user?.name ?? 'Guest',
      createdAt: new Date().toISOString().slice(0, 10), note: '',
    }, ...list]),
    update: (id, patch) => setComplaints((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c))),
  }
  return <Store.Provider value={value}>{children}</Store.Provider>
}

export function useStore() {
  const ctx = useContext(Store)
  if (!ctx) throw new Error('useStore must be used inside Provider')
  return ctx
}

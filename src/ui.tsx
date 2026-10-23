import type { ReactNode } from 'react'
import { LogOut, User as UserIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useAuth } from './auth'
import type { Priority, Status } from './types'

const STATUS_STYLE: Record<Status, string> = {
  Submitted: 'bg-blue-100 text-blue-700', 'Under Review': 'bg-purple-100 text-purple-700',
  'In Progress': 'bg-orange-100 text-orange-700', Resolved: 'bg-green-100 text-green-700', Escalated: 'bg-red-100 text-red-700',
}
const PRIORITY_STYLE: Record<Priority, string> = { Low: 'text-slate-500', Medium: 'text-blue-600', High: 'text-orange-500', Urgent: 'text-red-600 font-bold' }

export const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB')
export const StatusBadge = ({ s }: { s: Status }) => <span className={clsx('whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium', STATUS_STYLE[s])}>{s}</span>
export const PriorityText = ({ p }: { p: Priority }) => <span className={clsx('text-sm font-semibold', PRIORITY_STYLE[p])}>{p}</span>
export const Card = ({ children, className }: { children: ReactNode; className?: string }) => <div className={clsx('rounded-xl bg-white shadow-sm ring-1 ring-slate-100', className)}>{children}</div>
export const Th = ({ children }: { children: ReactNode }) => <th className="px-6 py-4 text-left text-sm font-medium uppercase text-slate-500">{children}</th>
export const input = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-400/30'
export const btn = 'rounded-lg bg-royal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-royal-500 disabled:opacity-50'
export const btnGhost = 'rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50'

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500 text-lg font-bold text-navy-900">GV</span>
      <span className="font-bold text-white">GVPIHLR</span>
    </div>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const nav = useNavigate()
  const link = ({ isActive }: { isActive: boolean }) => clsx('rounded-md px-4 py-2 text-sm font-medium', isActive ? 'bg-royal-600 text-white' : 'text-slate-200 hover:text-white')
  return (
    <div className="min-h-screen">
      <header className="bg-navy-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500 font-bold text-navy-900">GV</span>
            <span className="font-bold text-white">GVPIHLR | Smart Complaint System</span>
          </div>
          <nav className="mx-auto flex gap-2">
            <NavLink to={`/${user?.role}`} end className={link}>Dashboard</NavLink>
            {user?.role === 'student' && <NavLink to="/student/raise" className={link}>Raise Complaint</NavLink>}
          </nav>
          <div className="flex items-center gap-4 text-slate-200">
            <span className="flex items-center gap-2 text-sm"><UserIcon size={16} /> {user?.name}</span>
            <button aria-label="Log out" onClick={() => { signOut(); nav('/login') }} className="hover:text-white"><LogOut size={20} /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}

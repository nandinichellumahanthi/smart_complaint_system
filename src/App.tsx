import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { LogOut, MessageSquareWarning } from 'lucide-react'
import { useStore } from './store'
import { Admin, Home, Login, Mine, Submit } from './pages'
import type { ReactElement } from 'react'

function Guard({ children, role }: { children: ReactElement; role?: 'admin' }) {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/mine" replace />
  return children
}

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-navy-700 text-gold-400' : 'text-slate-300 hover:text-white'}`

export default function App() {
  const { user, logout } = useStore()
  return (
    <div className="min-h-screen">
      <header className="bg-navy-900">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          <NavLink to="/" className="mr-4 flex items-center gap-2 font-semibold text-white">
            <MessageSquareWarning className="text-gold-500" size={20} /> Smart Complaint System
          </NavLink>
          {user?.role === 'user' && (<><NavLink to="/submit" className={link}>New complaint</NavLink><NavLink to="/mine" className={link}>My complaints</NavLink></>)}
          {user?.role === 'admin' && <NavLink to="/admin" className={link}>Dashboard</NavLink>}
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-300">
            {user ? (<><span>{user.name} ({user.role})</span>
              <button onClick={logout} className="flex items-center gap-1 rounded px-2 py-1 hover:text-white"><LogOut size={16} /> Log out</button></>)
              : <NavLink to="/login" className={link}>Log in</NavLink>}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit" element={<Guard><Submit /></Guard>} />
          <Route path="/mine" element={<Guard><Mine /></Guard>} />
          <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

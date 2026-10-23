import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import { Layout } from './ui'
import type { Role } from './types'
import Login from './Login'
import Detail from './Detail'
import Admin from './Admin'
import { FacultyDashboard } from './Faculty'
import { RaiseComplaint, StudentDashboard } from './Student'

function Guard({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-10 text-center text-slate-600">Connecting to the server. The first load can take up to a minute.</p>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />
  return <Layout>{children}</Layout>
}

function Home() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? `/${user.role}` : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student" element={<Guard role="student"><StudentDashboard /></Guard>} />
      <Route path="/student/raise" element={<Guard role="student"><RaiseComplaint /></Guard>} />
      <Route path="/student/complaint/:id" element={<Guard role="student"><Detail /></Guard>} />
      <Route path="/faculty" element={<Guard role="faculty"><FacultyDashboard /></Guard>} />
      <Route path="/faculty/complaint/:id" element={<Guard role="faculty"><Detail /></Guard>} />
      <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
      <Route path="/admin/complaint/:id" element={<Guard role="admin"><Detail /></Guard>} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}

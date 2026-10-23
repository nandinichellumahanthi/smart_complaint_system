import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, Clock, FileText, TriangleAlert } from 'lucide-react'
import { clsx } from 'clsx'
import { api } from './api'
import { useAuth } from './auth'
import { Card, PriorityText, StatusBadge, Th } from './ui'
import type { Complaint } from './types'

export function FacultyDashboard() {
  const { user } = useAuth()
  const [list, setList] = useState<Complaint[] | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => { api<Complaint[]>('/complaints').then(setList).catch((e) => setErr(e.message)) }, [])
  const n = (s: string[]) => list?.filter((c) => s.includes(c.status)).length ?? 0
  const stats = [
    ['New / Review', n(['Submitted', 'Under Review']), FileText, 'border-blue-500', 'bg-blue-100 text-blue-500'],
    ['In Progress', n(['In Progress']), Clock, 'border-orange-500', 'bg-orange-100 text-orange-500'],
    ['Resolved', n(['Resolved']), CircleCheck, 'border-green-500', 'bg-green-100 text-green-500'],
    ['Escalated', n(['Escalated']), TriangleAlert, 'border-red-500', 'bg-red-100 text-red-500'],
  ] as const
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
      <div><p className="text-2xl text-slate-600">Welcome, <b className="text-navy-900">{user?.name}</b></p>{user?.department && <p className="text-slate-500">{user.department} Department</p>}</div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, v, Icon, border, tone]) => (
          <div key={label} className={clsx('flex items-start justify-between rounded-xl border-2 bg-white p-6', border)}><div><p className="text-slate-600">{label}</p><p className="mt-2 text-3xl font-bold">{v}</p></div>
            <span className={clsx('rounded-lg p-2.5', tone)}><Icon size={22} /></span></div>
        ))}
      </div>
      <Card className="overflow-x-auto">
        <h2 className="p-6 text-xl font-bold">Complaints Assigned to You</h2>
        <table className="w-full min-w-[720px]"><thead className="bg-slate-50"><tr><Th>Complaint ID</Th><Th>Student</Th><Th>Category</Th><Th>Priority</Th><Th>Status</Th><Th>Action</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {list?.map((c) => (
              <tr key={c._id}><td className="px-6 py-4 font-semibold">#{c.code}</td>
                <td className="px-6 py-4"><p className="font-semibold">{c.student?.name}</p><p className="text-sm text-slate-500">{c.location}</p></td>
                <td className="px-6 py-4">{c.category}</td><td className="px-6 py-4"><PriorityText p={c.priority} /></td><td className="px-6 py-4"><StatusBadge s={c.status} /></td>
                <td className="px-6 py-4"><Link to={`/faculty/complaint/${c._id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">View / Update</Link></td></tr>
            ))}
          </tbody></table>
        {list?.length === 0 && <p className="p-8 text-center text-slate-500">Nothing assigned to you yet. New complaints in your categories will show up here.</p>}
        {err && <p className="p-6 text-red-600">{err}</p>}
      </Card>
    </div>
  )
}

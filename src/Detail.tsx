import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { clsx } from 'clsx'
import { api } from './api'
import { useAuth } from './auth'
import { btn, Card, fmt, input, PriorityText, StatusBadge } from './ui'
import type { Complaint, Person, Status } from './types'

const ACTIONS: [Status, string][] = [['Under Review', 'text-purple-700'], ['In Progress', 'text-orange-700'], ['Resolved', 'text-green-700'], ['Escalated', 'text-red-700']]

export default function Detail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [c, setC] = useState<Complaint | null>(null)
  const [staff, setStaff] = useState<Person[]>([])
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const isStaff = user?.role !== 'student'
  useEffect(() => {
    api<Complaint>(`/complaints/${id}`).then(setC).catch((e) => setErr(e.message))
    if (user?.role === 'admin') api<Person[]>('/faculty').then(setStaff).catch(() => {})
  }, [id, user?.role])

  const run = (p: Promise<Complaint>) => p.then((x) => { setC(x); setErr('') }).catch((e) => setErr(e.message))
  const send = (e: FormEvent) => { e.preventDefault(); if (text.trim()) { run(api(`/complaints/${id}/comments`, { method: 'POST', body: { text } })); setText('') } }
  const back = `/${user?.role}`

  if (!c) return <div><Link to={back} className="text-royal-600">Back to Dashboard</Link><p className="mt-6 text-slate-600">{err || 'Loading...'}</p></div>
  const img = c.evidence?.startsWith('data:image')
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Complaint #{c.code}</h1>
      <Link to={back} className="flex items-center gap-2 text-slate-600 hover:text-navy-900"><ArrowLeft size={18} /> Back to Dashboard</Link>
      {err && <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-5 p-8">
            <div className="flex items-start justify-between gap-4"><h2 className="text-2xl font-bold">{c.title}</h2><StatusBadge s={c.status} /></div>
            <p className="text-lg text-slate-700">{c.description}</p>
            <div className="grid gap-5 rounded-lg bg-slate-50 p-6 sm:grid-cols-2">
              {([['Student Name', c.student?.name], ['Location', c.location], ['Category', c.category]] as const).map(([k, v]) => <div key={k}><p className="text-slate-500">{k}</p><p className="font-semibold">{v}</p></div>)}
              <div><p className="text-slate-500">Priority</p><PriorityText p={c.priority} /></div>
              <div><p className="text-slate-500">Raised on</p><p className="font-semibold">{fmt(c.createdAt)}</p></div>
              <div><p className="text-slate-500">Assigned to</p><p className="font-semibold">{c.assignedTo?.name ?? 'Admin (unassigned)'}</p></div>
            </div>
            {c.evidence && (img ? <img src={c.evidence} alt="Evidence" className="max-h-80 rounded-lg" /> : <a href={c.evidence} download="evidence" className="font-medium text-royal-600">Download evidence</a>)}
          </Card>
          <Card className="space-y-4 p-8">
            <h2 className="text-xl font-bold">Discussion &amp; Updates</h2>
            {c.comments.length === 0 && <p className="text-slate-500">No updates yet.</p>}
            {c.comments.map((m, i) => (
              <div key={i} className={clsx('rounded-lg border p-4', m.role === 'system' ? 'border-slate-100 bg-slate-50 text-sm text-slate-600' : 'border-slate-200')}>
                <div className="flex justify-between text-sm"><b>{m.by === user?.name ? 'You' : m.by}</b><span className="text-slate-500">{new Date(m.at).toLocaleString('en-GB')}</span></div>
                <p className="mt-1">{m.text}</p>
              </div>
            ))}
            <form onSubmit={send} className="flex gap-3"><input className={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type an update or comment..." />
              <button aria-label="Send" className={clsx(btn, 'px-4')}><Send size={18} /></button></form>
          </Card>
        </div>
        {isStaff && (
          <Card className="h-fit space-y-4 p-6">
            <h2 className="text-xl font-bold">Update Status</h2>
            {ACTIONS.map(([s, tone]) => (
              <button key={s} disabled={c.status === s} onClick={() => run(api(`/complaints/${id}/status`, { method: 'PATCH', body: { status: s } }))}
                className={clsx('w-full rounded-lg border border-slate-200 px-4 py-4 text-left text-lg font-medium hover:bg-slate-50 disabled:opacity-40', tone)}>Mark as {s}</button>
            ))}
            {user?.role === 'admin' && (
              <label className="block pt-2 text-sm font-medium">Assign to
                <select className={clsx(input, 'mt-1.5')} value={c.assignedTo?._id ?? ''} onChange={(e) => run(api(`/complaints/${id}/assign`, { method: 'PATCH', body: { assignedTo: e.target.value } }))}>
                  <option value="">Unassigned (Admin)</option>{staff.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></label>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

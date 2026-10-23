import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Database, Settings, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { clsx } from 'clsx'
import { api } from './api'
import { btn, btnGhost, Card, fmt, input, PriorityText, StatusBadge, Th } from './ui'
import { STATUSES, type Category, type Complaint, type Person } from './types'

const TABS = [['overview', 'Overview', Activity], ['all', 'All Complaints', Database], ['routes', 'Categories & Routing', Settings], ['members', 'Grievance Members', Users]] as const
type Tab = (typeof TABS)[number][0]

export default function Admin() {
  const nav = useNavigate()
  const [tab, setTab] = useState<Tab>('overview')
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [cats, setCats] = useState<Category[]>([])
  const [staff, setStaff] = useState<Person[]>([])
  const [err, setErr] = useState('')
  const load = () => {
    api<Complaint[]>('/complaints').then(setComplaints).catch((e) => setErr(e.message))
    api<Category[]>('/categories').then(setCats).catch((e) => setErr(e.message))
    api<Person[]>('/faculty').then(setStaff).catch((e) => setErr(e.message))
  }
  useEffect(load, [])
  const act = (p: Promise<unknown>) => p.then(() => { setErr(''); load() }).catch((e) => setErr(e.message))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Control Center</h1>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {TABS.map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={clsx('flex items-center gap-2 rounded-t-lg px-5 py-2.5 text-sm font-medium', tab === k ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}><Icon size={16} /> {label}</button>
        ))}
      </div>
      {err && <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
      {tab === 'overview' && <Overview list={complaints} />}
      {tab === 'all' && <All list={complaints} open={(id) => nav(`/admin/complaint/${id}`)} />}
      {tab === 'routes' && <Routes cats={cats} staff={staff} act={act} />}
      {tab === 'members' && <Members staff={staff} act={act} />}
    </div>
  )
}

function Overview({ list }: { list: Complaint[] }) {
  const n = (s: string[]) => list.filter((c) => s.includes(c.status)).length
  const pie = [['New', n(['Submitted', 'Under Review']), '#3B82F6'], ['In Progress', n(['In Progress']), '#F59E0B'], ['Resolved', n(['Resolved']), '#10B981'], ['Escalated', n(['Escalated']), '#EF4444']] as const
  const byCat = [...new Set(list.map((c) => c.category))].map((name) => ({ name, count: list.filter((c) => c.category === name).length }))
  const cards = [['Total Complaints', list.length, ''], ['New & Pending', pie[0][1], 'border-blue-500'], ['In Progress', pie[1][1], 'border-orange-500'], ['Resolved', pie[2][1], 'border-green-500']] as const
  return (<>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, v, border]) => <div key={label} className={clsx('rounded-xl bg-white p-8 text-center', border ? `border-2 ${border}` : 'shadow-sm ring-1 ring-slate-100')}><p className="text-4xl font-bold">{v}</p><p className="mt-1 text-slate-600">{label}</p></div>)}
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-6"><h2 className="mb-4 text-xl font-bold">Complaints by Category</h2>
        <div className="h-72"><ResponsiveContainer><BarChart data={byCat}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Bar dataKey="count" fill="#1D4ED8" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
      <Card className="p-6"><h2 className="mb-4 text-xl font-bold">Status Distribution</h2>
        <div className="flex h-72 items-center gap-4">
          <div className="h-full flex-1"><ResponsiveContainer><PieChart><Pie data={pie.map(([name, value]) => ({ name, value }))} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={2}>{pie.map(([k, , col]) => <Cell key={k} fill={col} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <ul className="space-y-3 text-sm">{pie.map(([k, v, col]) => <li key={k} className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: col }} />{k} ({v})</li>)}</ul>
        </div></Card>
    </div>
  </>)
}

function All({ list, open }: { list: Complaint[]; open: (id: string) => void }) {
  const [q, setQ] = useState('')
  const [st, setSt] = useState('')
  const rows = list.filter((c) => (!st || c.status === st) && `${c.code} ${c.student?.name} ${c.category} ${c.title}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <Card className="overflow-x-auto">
      <div className="flex flex-wrap justify-between gap-3 p-6">
        <input className={clsx(input, 'max-w-md')} placeholder="Search ID, Student, or Category..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={clsx(input, 'w-auto')} value={st} onChange={(e) => setSt(e.target.value)}><option value="">All Statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <table className="w-full min-w-[760px]"><thead className="bg-slate-50"><tr><Th>ID</Th><Th>Details</Th><Th>Category</Th><Th>Priority</Th><Th>Status</Th></tr></thead>
        <tbody className="divide-y divide-slate-100">{rows.map((c) => (
          <tr key={c._id} onClick={() => open(c._id)} className="cursor-pointer hover:bg-slate-50"><td className="px-6 py-4 font-semibold">#{c.code}</td>
            <td className="px-6 py-4"><p className="font-medium">{c.title}</p><p className="text-sm text-slate-500">{fmt(c.createdAt)} &middot; {c.student?.name}</p></td>
            <td className="px-6 py-4 text-slate-600">{c.category}</td><td className="px-6 py-4"><PriorityText p={c.priority} /></td><td className="px-6 py-4"><StatusBadge s={c.status} /></td></tr>))}</tbody></table>
      {rows.length === 0 && <p className="p-8 text-center text-slate-500">No complaints match your search.</p>}
    </Card>
  )
}

function Routes({ cats, staff, act }: { cats: Category[]; staff: Person[]; act: (p: Promise<unknown>) => void }) {
  const [edit, setEdit] = useState<string | null>(null)
  const [d, setD] = useState({ faculty: '', department: '' })
  const [adding, setAdding] = useState(false)
  const [nc, setNc] = useState({ name: '', department: '' })
  const add = (e: FormEvent) => { e.preventDefault(); act(api('/categories', { method: 'POST', body: nc })); setNc({ name: '', department: '' }); setAdding(false) }
  return (
    <Card className="overflow-x-auto">
      <div className="flex items-center justify-between p-6"><h2 className="text-xl font-bold">Email &amp; Routing Configuration</h2><button onClick={() => setAdding(!adding)} className={btn}>Add Category</button></div>
      {adding && <form onSubmit={add} className="flex flex-wrap gap-3 px-6 pb-6"><input required className={clsx(input, 'max-w-xs')} placeholder="Category name" value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} />
        <input className={clsx(input, 'max-w-xs')} placeholder="Department" value={nc.department} onChange={(e) => setNc({ ...nc, department: e.target.value })} /><button className={btn}>Save category</button></form>}
      <table className="w-full min-w-[760px]"><thead className="bg-slate-50"><tr><Th>Category Name</Th><Th>Department</Th><Th>Assigned Member / Email</Th><Th>Action</Th></tr></thead>
        <tbody className="divide-y divide-slate-100">{cats.map((c) => (
          <tr key={c._id}><td className="px-6 py-4 font-semibold">{c.name}</td>
            {edit === c._id ? (<>
              <td className="px-6 py-3"><input className={input} value={d.department} onChange={(e) => setD({ ...d, department: e.target.value })} /></td>
              <td className="px-6 py-3"><select className={input} value={d.faculty} onChange={(e) => setD({ ...d, faculty: e.target.value })}><option value="">Unassigned - Defaults to Admin</option>{staff.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.email})</option>)}</select></td>
              <td className="space-x-2 px-6 py-3"><button className="font-medium text-royal-600" onClick={() => { act(api(`/categories/${c._id}`, { method: 'PATCH', body: d })); setEdit(null) }}>Save</button><button className="text-slate-500" onClick={() => setEdit(null)}>Cancel</button></td>
            </>) : (<>
              <td className="px-6 py-4 text-slate-600">{c.department}</td>
              <td className="px-6 py-4">{c.faculty ? <span><span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />{c.faculty.name} <span className="text-sm text-slate-500">({c.faculty.email})</span></span> : <i className="text-slate-400">Unassigned - Defaults to Admin</i>}</td>
              <td className="px-6 py-4"><button className="font-medium text-royal-600" onClick={() => { setEdit(c._id); setD({ faculty: c.faculty?._id ?? '', department: c.department }) }}>Edit Route</button></td>
            </>)}</tr>))}</tbody></table>
    </Card>
  )
}

function Members({ staff, act }: { staff: Person[]; act: (p: Promise<unknown>) => void }) {
  const [adding, setAdding] = useState(false)
  const [m, setM] = useState({ name: '', email: '', department: '' })
  const add = (e: FormEvent) => { e.preventDefault(); act(api('/faculty', { method: 'POST', body: m })); setM({ name: '', email: '', department: '' }); setAdding(false) }
  return (
    <Card className="overflow-x-auto">
      <div className="flex items-center justify-between p-6"><h2 className="text-xl font-bold">Grievance Members</h2><button onClick={() => setAdding(!adding)} className={btn}>Add Member</button></div>
      {adding && <form onSubmit={add} className="flex flex-wrap gap-3 px-6 pb-6"><input required className={clsx(input, 'max-w-xs')} placeholder="Full name" value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} />
        <input required type="email" className={clsx(input, 'max-w-xs')} placeholder="Email" value={m.email} onChange={(e) => setM({ ...m, email: e.target.value })} />
        <input className={clsx(input, 'max-w-xs')} placeholder="Department" value={m.department} onChange={(e) => setM({ ...m, department: e.target.value })} /><button className={btn}>Add faculty</button>
        <p className="w-full text-sm text-slate-500">Tell them to open the site, choose the Faculty tab, click Register here, and use this email.</p></form>}
      <table className="w-full min-w-[680px]"><thead className="bg-slate-50"><tr><Th>Name</Th><Th>Email</Th><Th>Department</Th><Th>Account</Th><Th>Action</Th></tr></thead>
        <tbody className="divide-y divide-slate-100">{staff.map((p) => (
          <tr key={p._id}><td className="px-6 py-4 font-semibold">{p.name}</td><td className="px-6 py-4 text-slate-600">{p.email}</td><td className="px-6 py-4 text-slate-600">{p.department}</td>
            <td className="px-6 py-4"><span className={clsx('rounded-full px-3 py-1 text-xs font-medium', p.registered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>{p.registered ? 'Registered' : 'Invited'}</span></td>
            <td className="px-6 py-4"><button className={clsx(btnGhost, 'px-3 py-1.5 text-red-600')} onClick={() => confirm(`Remove ${p.name}?`) && act(api(`/faculty/${p._id}`, { method: 'DELETE' }))}>Remove</button></td></tr>))}</tbody></table>
      {staff.length === 0 && <div className="p-10 text-center text-slate-500"><Users className="mx-auto mb-3" size={40} />No faculty yet. Add a member so they can register and receive complaints.</div>}
    </Card>
  )
}

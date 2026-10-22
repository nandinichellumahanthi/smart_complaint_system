import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { clsx } from 'clsx'
import { CATEGORIES, STATUSES, useStore, type Category, type Complaint, type Status } from './store'

const input = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-400/40'
const btn = 'rounded-md bg-royal-600 px-4 py-2 text-sm font-medium text-white hover:bg-royal-500'
const STATUS_STYLE: Record<Status, string> = {
  Pending: 'bg-amber-100 text-amber-800', 'In Progress': 'bg-blue-100 text-blue-800', Resolved: 'bg-emerald-100 text-emerald-800',
}
const Badge = ({ s }: { s: Status }) => <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[s])}>{s}</span>

export function Home() {
  const { user } = useStore()
  return (
    <section className="rounded-xl bg-navy-900 p-8 text-white sm:p-12">
      <h1 className="max-w-xl text-3xl font-bold sm:text-4xl">Report a problem. Watch it get fixed.</h1>
      <p className="mt-3 max-w-lg text-slate-300">File a complaint in under a minute, then follow its status from Pending to Resolved.</p>
      <Link to={user ? (user.role === 'admin' ? '/admin' : '/submit') : '/login'} className="mt-6 inline-block rounded-md bg-gold-500 px-5 py-2.5 font-semibold text-navy-900 hover:bg-gold-400">
        {user ? (user.role === 'admin' ? 'Open dashboard' : 'File a complaint') : 'Log in to start'}
      </Link>
    </section>
  )
}

export function Login() {
  const { login } = useStore()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setErr('Enter your name.')
    if (role === 'admin' && pw !== 'admin123') return setErr('Wrong admin password (demo password: admin123).')
    login({ name: name.trim(), role })
    nav(role === 'admin' ? '/admin' : '/submit')
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-xl font-bold">Log in</h1>
      <div className="flex gap-2">
        {(['user', 'admin'] as const).map((r) => (
          <button type="button" key={r} onClick={() => setRole(r)} className={clsx('flex-1 rounded-md border px-3 py-2 text-sm capitalize', role === r ? 'border-royal-500 bg-royal-500 text-white' : 'border-slate-300')}>{r === 'user' ? 'Citizen' : 'Admin'}</button>
        ))}
      </div>
      <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      {role === 'admin' && <input className={input} type="password" placeholder="Admin password" value={pw} onChange={(e) => setPw(e.target.value)} />}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className={clsx(btn, 'w-full')}>Log in</button>
    </form>
  )
}

export function Submit() {
  const { add } = useStore()
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('Water')
  const [description, setDescription] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    add({ title: title.trim(), category, description: description.trim() })
    nav('/mine')
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-xl font-bold">New complaint</h1>
      <input required className={input} placeholder="Short title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <select className={input} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <textarea required rows={5} className={input} placeholder="Describe the problem and where it is" value={description} onChange={(e) => setDescription(e.target.value)} />
      <button className={btn}>Submit complaint</button>
    </form>
  )
}

export function Mine() {
  const { user, complaints } = useStore()
  const mine = complaints.filter((c) => c.owner === user?.name)
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">My complaints</h1>
      {mine.length === 0 && <p className="text-slate-600">Nothing here yet. <Link to="/submit" className="text-royal-600 underline">File your first complaint.</Link></p>}
      {mine.map((c) => (
        <article key={c.id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-3"><h2 className="font-semibold">{c.title}</h2><Badge s={c.status} /></div>
          <p className="mt-1 text-sm text-slate-600">{c.description}</p>
          <p className="mt-2 text-xs text-slate-500">{c.id} · {c.category} · {c.createdAt}</p>
          {c.note && <p className="mt-2 rounded bg-light-100 px-3 py-2 text-sm">Update from admin: {c.note}</p>}
        </article>
      ))}
    </div>
  )
}

export function Admin() {
  const { complaints, update } = useStore()
  const [filter, setFilter] = useState<Status | 'All'>('All')
  const byCat = CATEGORIES.map((c) => ({ name: c, count: complaints.filter((x) => x.category === c).length }))
  const byStatus = STATUSES.map((s) => ({ name: s, value: complaints.filter((x) => x.status === s).length }))
  const colors = ['#F59E0B', '#2563EB', '#10B981']
  const rows: Complaint[] = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter)
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {byStatus.map((s) => <div key={s.name} className="rounded-lg bg-white p-4 ring-1 ring-slate-200"><p className="text-3xl font-bold">{s.value}</p><p className="text-sm text-slate-600">{s.name}</p></div>)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-64 rounded-lg bg-white p-4 ring-1 ring-slate-200">
          <ResponsiveContainer><BarChart data={byCat}><XAxis dataKey="name" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
        <div className="h-64 rounded-lg bg-white p-4 ring-1 ring-slate-200">
          <ResponsiveContainer><PieChart><Pie data={byStatus} dataKey="value" nameKey="name" label>{byStatus.map((_, i) => <Cell key={i} fill={colors[i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </div>
      </div>
      <div className="flex gap-2">
        {(['All', ...STATUSES] as const).map((s) => <button key={s} onClick={() => setFilter(s)} className={clsx('rounded-full border px-3 py-1 text-sm', filter === s ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white')}>{s}</button>)}
      </div>
      <div className="space-y-3">
        {rows.map((c) => (
          <article key={c.id} className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-semibold">{c.title}</h2><p className="text-xs text-slate-500">{c.id} · {c.category} · by {c.owner} · {c.createdAt}</p></div>
              <select aria-label="Status" className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={c.status} onChange={(e) => update(c.id, { status: e.target.value as Status })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <p className="mt-2 text-sm text-slate-600">{c.description}</p>
            <input className={clsx(input, 'mt-3')} placeholder="Add an update for the citizen" value={c.note} onChange={(e) => update(c.id, { note: e.target.value })} />
          </article>
        ))}
        {rows.length === 0 && <p className="text-slate-600">No complaints with this status.</p>}
      </div>
    </div>
  )
}

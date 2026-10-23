import { useEffect, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, ChevronRight, CircleCheck, CirclePlus, Clock, CloudUpload, FileText } from 'lucide-react'
import { clsx } from 'clsx'
import { api } from './api'
import { useAuth } from './auth'
import { btn, btnGhost, Card, fmt, input, StatusBadge, Th } from './ui'
import { PRIORITIES, type Category, type Complaint, type Priority } from './types'

export function StudentDashboard() {
  const { user } = useAuth()
  const [list, setList] = useState<Complaint[] | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => { api<Complaint[]>('/complaints').then(setList).catch((e) => setErr(e.message)) }, [])
  const h = new Date().getHours()
  const hello = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'
  const n = (s: string[]) => list?.filter((c) => s.includes(c.status)).length ?? 0
  const stats = [
    ['In Progress', n(['In Progress']), Clock, 'bg-orange-100 text-orange-500'],
    ['Resolved', n(['Resolved']), CircleCheck, 'bg-green-100 text-green-500'],
    ['Pending', n(['Submitted', 'Under Review']), FileText, 'bg-blue-100 text-blue-500'],
  ] as const
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div>
        <p className="text-2xl text-slate-600">{hello}, <b className="text-navy-900">{user?.name}</b></p>
        <p className="text-slate-500">Raise an issue and help us improve the campus.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-navy-900 p-6 text-white"><p className="text-royal-400">Total Complaints</p><p className="mt-2 text-3xl font-bold">{list?.length ?? '-'}</p></div>
        {stats.map(([label, v, Icon, tone]) => (
          <Card key={label} className="flex items-start justify-between p-6"><div><p className="text-slate-600">{label}</p><p className="mt-2 text-3xl font-bold">{v}</p></div>
            <span className={clsx('rounded-lg p-2.5', tone)}><Icon size={22} /></span></Card>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Recent Complaints</h2>
        <Link to="/student/raise" className={clsx(btn, 'flex items-center gap-2')}><CirclePlus size={18} /> Raise a Complaint</Link>
      </div>
      {err && <p className="text-red-600">{err}</p>}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px]"><thead className="bg-slate-50"><tr><Th>Complaint ID</Th><Th>Category</Th><Th>Description</Th><Th>Date</Th><Th>Status</Th><Th>Action</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {list?.map((c) => (
              <tr key={c._id}><td className="px-6 py-4 font-semibold">#{c.code}</td><td className="px-6 py-4">{c.category}</td><td className="px-6 py-4 text-slate-600">{c.title}</td>
                <td className="px-6 py-4 text-slate-600">{fmt(c.createdAt)}</td><td className="px-6 py-4"><StatusBadge s={c.status} /></td>
                <td className="px-6 py-4"><Link className="font-medium text-royal-600" to={`/student/complaint/${c._id}`}>Track</Link></td></tr>
            ))}
          </tbody></table>
        {list?.length === 0 && <p className="p-8 text-center text-slate-500">No complaints yet. Raise your first complaint to get started.</p>}
        {!list && !err && <p className="p-8 text-center text-slate-500">Loading...</p>}
      </Card>
    </div>
  )
}

const LOCATIONS = ['Main Building', 'Block A', 'Block B', 'Block C', 'Library', 'Boys Hostel', 'Girls Hostel', 'Mess / Canteen', 'Computer Lab', 'Playground', 'Bus / Transport', 'Other']
const STEPS = ['Category', 'Details', 'Evidence', 'Submit']

export function RaiseComplaint() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [cats, setCats] = useState<Category[]>([])
  const [f, setF] = useState({ category: '', title: '', description: '', place: '', spot: '', priority: 'Low' as Priority, evidence: '' })
  const [fileName, setFileName] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { api<Category[]>('/categories').then(setCats).catch((e) => setErr(e.message)) }, [])
  const location = f.place + (f.spot ? ` - ${f.spot}` : '')

  const next = () => {
    setErr('')
    if (step === 0 && !f.category) return setErr('Select a category to continue.')
    if (step === 1 && (!f.title.trim() || !f.description.trim() || !f.place)) return setErr('Add a title, a description and a location.')
    setStep(step + 1)
  }
  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) return setErr('File is larger than 5 MB.')
    const r = new FileReader(); r.onload = () => { setF({ ...f, evidence: String(r.result) }); setFileName(file.name); setErr('') }; r.readAsDataURL(file)
  }
  const submit = async () => {
    setBusy(true); setErr('')
    try { await api('/complaints', { method: 'POST', body: { ...f, location } }); nav('/student') }
    catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Raise a Complaint</h1>
      <ol className="my-8 grid grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-col items-center gap-2 text-xs font-medium">
            <span className={clsx('flex h-9 w-9 items-center justify-center rounded-full text-sm', i < step ? 'bg-green-500 text-white' : i === step ? 'bg-royal-600 text-white' : 'bg-slate-200 text-slate-500')}>{i < step ? <Check size={16} /> : i + 1}</span>{s}
          </li>
        ))}
      </ol>
      <Card className="space-y-6 p-8">
        {step === 0 && (<>
          <h2 className="text-xl font-bold">Select Category</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {cats.map((c) => (
              <button key={c._id} onClick={() => setF({ ...f, category: c.name })}
                className={clsx('flex items-center gap-3 rounded-lg border p-4 text-left font-medium', f.category === c.name ? 'border-royal-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50')}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-600">{c.name[0]}</span>{c.name}
              </button>
            ))}
          </div>
        </>)}
        {step === 1 && (<>
          <h2 className="text-xl font-bold">Complaint Details</h2>
          <label className="block text-sm font-medium">Complaint Title<input className={clsx(input, 'mt-1.5')} placeholder="E.g. Broken window in hostel room" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
          <label className="block text-sm font-medium">Description<textarea rows={5} className={clsx(input, 'mt-1.5')} placeholder="Describe the issue in detail..." value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
          <label className="block text-sm font-medium">Location
            <select className={clsx(input, 'mt-1.5')} value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })}><option value="">Select Location / Details</option>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></label>
          <input className={input} placeholder="Floor, room or exact spot (optional)" value={f.spot} onChange={(e) => setF({ ...f, spot: e.target.value })} />
        </>)}
        {step === 2 && (<>
          <h2 className="text-xl font-bold">Upload Evidence (Optional)</h2>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-10 text-center">
            <CloudUpload size={40} className="text-slate-400" />
            <span className="font-medium">{fileName || 'Click to upload a photo or PDF'}</span>
            <span className="text-xs text-slate-500">PNG, JPG or PDF (max. 5 MB)</span>
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={pick} />
          </label>
        </>)}
        {step === 3 && (<>
          <h2 className="text-xl font-bold">Review &amp; Submit</h2>
          <div><p className="mb-2 text-sm font-medium">Select Priority</p>
            <div className="flex flex-wrap gap-2">{PRIORITIES.map((p) => (
              <button key={p} onClick={() => setF({ ...f, priority: p })} className={clsx('rounded-full border px-5 py-2 text-sm font-medium', f.priority === p ? 'border-royal-500 bg-royal-500 text-white' : 'border-slate-300')}>{p}</button>))}</div></div>
          <div className="space-y-2 rounded-lg bg-slate-50 p-6 text-sm">
            <p className="border-b border-slate-200 pb-3 text-base font-bold">Summary</p>
            {([['Category', f.category], ['Title', f.title], ['Location', location], ['Evidence', fileName || 'None']] as const).map(([k, v]) => <p key={k}><span className="text-slate-500">{k}: </span>{v}</p>)}
          </div>
        </>)}
        {err && <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
        <div className="flex justify-between border-t border-slate-100 pt-6">
          {step > 0 ? <button onClick={() => { setStep(step - 1); setErr('') }} className={btnGhost}>Back</button> : <span />}
          {step < 3 ? <button onClick={next} className={clsx(btn, 'flex items-center gap-1')}>Next Step <ChevronRight size={16} /></button>
            : <button disabled={busy} onClick={submit} className={btn}>{busy ? 'Submitting...' : 'Submit Complaint'}</button>}
        </div>
      </Card>
    </div>
  )
}

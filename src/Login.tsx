import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck, Building2, Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'
import { api } from './api'
import { useAuth } from './auth'
import { btn, input, Logo } from './ui'
import type { Role, User } from './types'

const TABS = [['student', 'Student', GraduationCap], ['faculty', 'Faculty', Building2], ['admin', 'Admin', ShieldCheck]] as const

export default function Login() {
  const { signIn } = useAuth()
  const nav = useNavigate()
  const [role, setRole] = useState<Role>('student')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [f, setF] = useState({ name: '', rollNo: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })
  const register = mode === 'register' && role !== 'admin'

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const path = !register ? '/auth/login' : role === 'student' ? '/auth/register' : '/auth/register-faculty'
      const r = await api<{ token: string; user: User }>(path, { method: 'POST', body: { ...f, role } })
      signIn(r.token, r.user); nav(`/${r.user.role}`)
    } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-navy-900 p-10 text-white lg:p-16">
        <Logo />
        <div>
          <h1 className="text-4xl font-bold leading-tight lg:text-5xl">Smart Complaint System</h1>
          <p className="mt-4 text-xl text-royal-400">&ldquo;Your Voice &bull; Our Campus &bull; Better Tomorrow&rdquo;</p>
          <p className="mt-6 max-w-md text-slate-200">Report campus issues, track progress, and help build a better campus environment together.</p>
        </div>
        <ul className="space-y-4 text-slate-200">
          {['Easy and quick reporting process', 'Real-time tracking of your complaints', 'Faster resolution by dedicated teams'].map((t) => (
            <li key={t} className="flex items-center gap-3"><CircleCheck className="text-gold-500" size={22} /> {t}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col items-center justify-center px-6 py-12">
        <h2 className="text-3xl font-bold">{register ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="mt-2 text-slate-600">{register ? 'Register to start raising complaints' : 'Login to your account to continue'}</p>
        <form onSubmit={submit} className="mt-8 w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1.5">
            {TABS.map(([r, label, Icon]) => (
              <button type="button" key={r} onClick={() => { setRole(r); setErr(''); if (r === 'admin') setMode('login') }}
                className={clsx('flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium', role === r ? 'bg-white shadow-sm' : 'text-slate-500')}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
          {register && role === 'student' && (<>
            <label className="block text-sm font-medium">Full name<input required className={clsx(input, 'mt-1.5')} value={f.name} onChange={set('name')} placeholder="Enter your full name" /></label>
            <label className="block text-sm font-medium">College ID / Roll number<input className={clsx(input, 'mt-1.5')} value={f.rollNo} onChange={set('rollNo')} placeholder="Enter your roll number" /></label>
          </>)}
          <label className="block text-sm font-medium">{register ? 'Email' : 'College ID / Email'}
            <input required className={clsx(input, 'mt-1.5')} value={f.email} onChange={set('email')} placeholder="Enter your email" /></label>
          <label className="block text-sm font-medium">Password
            <div className="relative mt-1.5">
              <input required minLength={register ? 6 : undefined} type={show ? 'text' : 'password'} className={input} value={f.password} onChange={set('password')} placeholder="Enter your password" />
              <button type="button" aria-label="Show password" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-slate-400">{show ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
          </label>
          {register && role === 'faculty' && <p className="text-sm text-slate-600">Use the email the admin added for you. Faculty accounts can only be created by the admin.</p>}
          {err && <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
          <button disabled={busy} className={clsx(btn, 'w-full py-3.5 text-base')}>{busy ? 'Please wait...' : register ? 'Create account' : 'Login to Continue'}</button>
          {role !== 'admin' && (
            <p className="text-center text-sm text-slate-600">
              {register ? 'Already have an account?' : role === 'student' ? 'New student?' : 'Added by the admin?'}{' '}
              <button type="button" onClick={() => { setMode(register ? 'login' : 'register'); setErr('') }} className="font-semibold text-royal-600">
                {register ? 'Log in' : 'Register here'}
              </button>
            </p>
          )}
        </form>
      </section>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserCircle, Crown, HouseSimple, BookmarkSimple,
  DownloadSimple, Gear, Question, Info,
  SignOut, X, Eye, EyeSlash,
  Lightning, Lock, EnvelopeSimple,
  CheckCircle, WarningCircle, SpinnerGap,
} from '@phosphor-icons/react'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { user, signIn, signUp, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(''); setBusy(true)
    if (authMode === 'login') {
      const { error } = await signIn(form.email, form.password)
      if (error) setError(error)
      else setSuccess('Welcome back!')
    } else {
      if (!form.name.trim()) { setError('Please enter your name'); setBusy(false); return }
      const { error } = await signUp(form.email, form.password, form.name)
      if (error) setError(error)
      else setSuccess('Account created! Check your email to verify.')
    }
    setBusy(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SpinnerGap weight="bold" size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  // ── Logged in view ──────────────────────────────────────
  if (user) return <LoggedInProfile user={user} signOut={signOut} navigate={navigate} />

  // ── Auth form ──────────────────────────────────────────
  return (
    <div className="bg-mesh min-h-screen flex items-start justify-center px-5 pt-8 pb-24">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-glow-md mb-4">
            <Lightning weight="fill" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Chillz</h1>
          <p className="text-muted text-sm mt-1">Watch. Chill. Repeat.</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 space-y-5"
          style={{ background: 'rgba(19,17,28,0.95)', border: '1px solid rgba(45,38,69,0.8)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>

          {/* Tab switcher */}
          <div className="flex p-1 rounded-2xl" style={{ background: 'rgba(10,10,15,0.6)', border: '1px solid rgba(45,38,69,0.6)' }}>
            {(['login', 'signup'] as const).map(mode => (
              <button key={mode} onClick={() => { setAuthMode(mode); setError(''); setSuccess('') }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: authMode === mode ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                  color: authMode === mode ? '#fff' : '#7C7A91',
                  boxShadow: authMode === mode ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                }}>
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div className="relative">
                <UserCircle weight="duotone" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input type="text" placeholder="Full name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required className="w-full rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-muted focus:outline-none transition-all"
                  style={{ background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(45,38,69,0.8)' }} />
              </div>
            )}

            <div className="relative">
              <EnvelopeSimple weight="duotone" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input type="email" placeholder="Email address" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required className="w-full rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-muted focus:outline-none transition-all"
                style={{ background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(45,38,69,0.8)' }} />
            </div>

            <div className="relative">
              <Lock weight="duotone" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required minLength={6} className="w-full rounded-2xl pl-11 pr-11 py-3 text-sm text-white placeholder-muted focus:outline-none transition-all"
                style={{ background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(45,38,69,0.8)' }} />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors">
                {showPassword ? <EyeSlash weight="duotone" size={16} /> : <Eye weight="duotone" size={16} />}
              </button>
            </div>

            {/* Error / success */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                <WarningCircle weight="duotone" size={16} className="shrink-0" />
                <p className="text-xs">{error}</p>
                <button onClick={() => setError('')} className="ml-auto shrink-0"><X size={12} /></button>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-3 py-2">
                <CheckCircle weight="duotone" size={16} className="shrink-0" />
                <p className="text-xs">{success}</p>
              </div>
            )}

            <button type="submit" disabled={busy}
              className="w-full py-3 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 6px 20px rgba(124,58,237,0.5)' }}>
              {busy
                ? <SpinnerGap weight="bold" size={18} className="animate-spin" />
                : authMode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          <p className="text-[11px] text-muted text-center">
            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-primary-light font-bold hover:underline">
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Premium banner */}
        <div className="mt-4 rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
          style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(236,72,153,0.1))', border: '1px solid rgba(124,58,237,0.3)' }}>
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
            <Crown weight="fill" size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-white">Upgrade to Premium</p>
            <p className="text-[11px] text-muted">Unlock HD, downloads & ad-free. Coming soon via JjumaPay.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Logged-in sidebar profile ── */
function LoggedInProfile({ user, signOut, navigate }: {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } }
  signOut: () => Promise<void>
  navigate: (path: string) => void
}) {
  const { isPremium } = useAuth()
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const avatar = user.user_metadata?.avatar_url

  const menuItems = [
    { icon: HouseSimple,   label: 'Home',          action: () => navigate('/') },
    { icon: BookmarkSimple,label: 'My Watchlist',   action: () => navigate('/watchlist') },
    { icon: DownloadSimple,label: 'Downloads',      action: () => navigate('/watchlist') },
    { icon: Gear,          label: 'Settings',       action: () => {} },
    { icon: Question,      label: 'Help & Support', action: () => {} },
    { icon: Info,          label: 'About Chillz',   action: () => {} },
  ]

  return (
    <div className="bg-mesh min-h-screen pb-24">

      {/* Profile header */}
      <div className="relative overflow-hidden px-5 pt-8 pb-6"
        style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.2) 0%, transparent 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-15"
            style={{ background: 'radial-gradient(ellipse,#7C3AED,transparent)' }} />
        </div>

        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-primary shadow-glow-sm">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                  <UserCircle weight="fill" size={40} className="text-white" />
                </div>
              )}
            </div>
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center border-2 border-bg">
                <Crown weight="fill" size={12} className="text-bg" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{name}</h2>
            <p className="text-sm text-muted">{user.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-black px-2.5 py-1 rounded-full"
              style={{
                background: isPremium ? 'rgba(245,158,11,0.2)' : 'rgba(124,58,237,0.15)',
                border: isPremium ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(124,58,237,0.3)',
                color: isPremium ? '#F59E0B' : '#A78BFA',
              }}>
              {isPremium ? <><Crown weight="fill" size={10} /> Premium User</> : '⚡ Free Plan'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 space-y-4">

        {/* Premium upgrade CTA (only for free users) */}
        {!isPremium && (
          <button onClick={() => navigate('/checkout')}
            className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all hover:-translate-y-0.5 text-left"
            style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(236,72,153,0.15))', border: '1px solid rgba(124,58,237,0.35)', boxShadow: '0 8px 24px rgba(124,58,237,0.2)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
              <Crown weight="fill" size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-white">Upgrade to Premium</p>
              <p className="text-[11px] text-muted mt-0.5">HD streams · Downloads · Ad-free · UGX 5,000/mo</p>
            </div>
            <div className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 4px 12px rgba(124,58,237,0.4)' }}>
              Pay Now
            </div>
          </button>
        )}

        {/* Premium active banner */}
        {isPremium && (
          <div className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.1))', border: '1px solid rgba(16,185,129,0.35)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
              <Crown weight="fill" size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Premium Active ✓</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">All features unlocked</p>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Watchlist', value: '0' },
            { label: 'Downloaded', value: '0' },
            { label: 'Watched', value: '0' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Menu items */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(45,38,69,0.6)' }}>
          {menuItems.map(({ icon: Icon, label, action }, i) => (
            <button key={label} onClick={action}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-surface-2 transition-colors group"
              style={{ borderBottom: i < menuItems.length - 1 ? '1px solid rgba(45,38,69,0.4)' : 'none', background: 'rgba(19,17,28,0.8)' }}>
              <div className="w-9 h-9 rounded-xl bg-surface-3 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Icon weight="duotone" size={18} className="text-primary-light" />
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-primary-light transition-colors">{label}</span>
              <span className="ml-auto text-muted text-xs">›</span>
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-red-400 transition-all hover:bg-red-500/10"
          style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
          <SignOut weight="bold" size={16} />
          Log Out
        </button>

        <p className="text-center text-[11px] text-muted pb-2">Chillz v1.0 · Powered by Supabase</p>
      </div>
    </div>
  )
}

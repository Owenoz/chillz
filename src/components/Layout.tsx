import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  HouseSimple, Television, SoccerBall,
  FilmSlate, UserCircle, MagnifyingGlass,
  BellSimple, Play,
} from '@phosphor-icons/react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/',       label: 'Home',    Icon: HouseSimple },
  { to: '/tv',     label: 'Live TV', Icon: Television  },
  { to: '/sports', label: 'Sports',  Icon: SoccerBall  },
  { to: '/movies', label: 'Movies',  Icon: FilmSlate   },
  { to: '/profile',label: 'More',    Icon: UserCircle  },
]

export default function Layout() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-bg text-[#E8E6F0]">

      {/* ── Top header ── */}
      <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-2xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-all">
              <Play weight="fill" size={14} className="text-white translate-x-0.5" />
            </div>
            <span className="font-black text-lg tracking-tight text-white hidden sm:block">
              Chillz
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navItems.slice(0, 4).map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-glow-sm'
                      : 'text-muted hover:text-white hover:bg-surface-2'
                  }`
                }
              >
                <Icon weight="duotone" size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-muted hover:text-white hover:border-primary/40 transition-all">
              <MagnifyingGlass weight="bold" size={16} />
            </button>
            <button className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-muted hover:text-white hover:border-primary/40 transition-all relative">
              <BellSimple weight="bold" size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-xl overflow-hidden border-2 border-primary/40 hover:border-primary transition-all"
            >
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                  <UserCircle weight="fill" size={20} className="text-primary-light" />
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Page ── */}
      <main className="mb-20 md:mb-0">
        <Outlet />
      </main>

      {/* ── Bottom tab bar (mobile) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
        style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(45,38,69,0.8)' }}>
        <div className="flex items-center">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-[9px] font-bold tracking-wider uppercase transition-all ${
                  isActive ? 'text-primary-light' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-primary shadow-glow-sm' : ''
                  }`}>
                    <Icon weight={isActive ? 'fill' : 'regular'} size={20}
                      className={isActive ? 'text-white' : 'text-muted'} />
                  </div>
                  <span className={isActive ? 'text-primary-light' : ''}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

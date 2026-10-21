import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  HouseSimple,
  Television,
  SoccerBall,
  FilmSlate,
  List,
  X,
  Lightning,
} from '@phosphor-icons/react'

const navItems = [
  { to: '/',       label: 'Home',    Icon: HouseSimple  },
  { to: '/tv',     label: 'Live TV', Icon: Television   },
  { to: '/sports', label: 'Sports',  Icon: SoccerBall   },
  { to: '/movies', label: 'Movies',  Icon: FilmSlate    },
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg text-gray-100">

      {/* ── Top nav ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/75 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[56px] flex items-center gap-6">

          {/* Wordmark */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="w-7 h-7 rounded-[10px] bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all group-hover:scale-105">
              <Lightning weight="fill" className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-[17px] tracking-[-0.03em] text-white hidden sm:block">
              chillz
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-1">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium tracking-[-0.01em] transition-all ${
                    isActive
                      ? 'bg-white/8 text-white'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                  }`
                }
              >
                <Icon weight="duotone" size={15} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen
              ? <X weight="bold" size={18} />
              : <List weight="bold" size={18} />
            }
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <nav className="md:hidden border-t border-border bg-bg/95 backdrop-blur-2xl">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3.5 text-[13px] font-medium border-b border-border/40 last:border-0 transition-colors ${
                    isActive ? 'text-white bg-white/5' : 'text-gray-500 hover:text-white'
                  }`
                }
              >
                <Icon weight="duotone" size={16} className="shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* ── Page content ────────────────────────────────── */}
      <main>
        <Outlet />
      </main>

      {/* ── Bottom tab bar (mobile) ──────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-2xl border-t border-border flex pb-safe">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-[0.02em] uppercase transition-colors ${
                isActive ? 'text-white' : 'text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  weight={isActive ? 'fill' : 'regular'}
                  size={22}
                  className="transition-transform"
                  style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

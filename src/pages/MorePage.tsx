import { useNavigate } from 'react-router-dom'
import {
  Radio, Church, Newspaper, SoccerBall,
  Globe, Crown, BookmarkSimple,
  Lightning,
} from '@phosphor-icons/react'
import { useAuth } from '../contexts/AuthContext'

const SECTIONS = [
  {
    id: 'radio',
    label: 'Uganda Radio',
    desc: '10 stations · CBS, Akaboozi, Capital, Sanyu & more',
    icon: Radio,
    color: '#7C3AED',
    path: '/radio',
    badge: 'LIVE',
  },
  {
    id: 'church',
    label: 'Church & Gospel',
    desc: 'Watoto, Miracle Centre, Victory & more',
    icon: Church,
    color: '#EC4899',
    path: '/church',
    badge: 'LIVE',
  },
  {
    id: 'news',
    label: 'Uganda News',
    desc: 'NTV, NBS, BBS, Bukedde, Spark, Galaxy',
    icon: Newspaper,
    color: '#DC2626',
    path: '/news',
    badge: 'LIVE',
  },
  {
    id: 'upl',
    label: 'Uganda Premier League',
    desc: 'Fixtures, standings · Vipers, KCCA, Express & more',
    icon: SoccerBall,
    color: '#F59E0B',
    path: '/upl',
    badge: null,
  },
  {
    id: 'nollywood',
    label: 'Africa & Nollywood',
    desc: 'Nigerian, Swahili, East African & Ghanaian cinema',
    icon: Globe,
    color: '#16A34A',
    path: '/nollywood',
    badge: 'NEW',
  },
  {
    id: 'watchlist',
    label: 'My Watchlist',
    desc: 'Saved movies & continue watching',
    icon: BookmarkSimple,
    color: '#6366F1',
    path: '/watchlist',
    badge: null,
  },
  {
    id: 'profile',
    label: 'Account & Premium',
    desc: 'Sign in, upgrade to premium via JjumaPay',
    icon: Crown,
    color: '#F97316',
    path: '/profile',
    badge: null,
  },
]

export default function MorePage() {
  const navigate = useNavigate()
  const { user, isPremium } = useAuth()

  return (
    <div className="bg-mesh min-h-screen pb-24">

      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/40"
        style={{ background: 'linear-gradient(180deg,rgba(124,58,237,0.1) 0%,transparent 100%)' }}>
        <div className="max-w-7xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow-sm">
              <Lightning weight="fill" size={22} className="text-white"/>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Chillz</h1>
              <p className="text-muted text-sm">Watch. Chill. Repeat.</p>
            </div>
          </div>

          {/* User pill */}
          {user && (
            <button onClick={() => navigate('/profile')}
              className="mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left transition-all hover:-translate-y-0.5"
              style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(19,17,28,0.9))', border:'1px solid rgba(124,58,237,0.35)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                <span className="text-white font-black text-lg">
                  {(user.email?.[0] || '?').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-[11px] text-muted">{user.email}</p>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full shrink-0"
                style={{
                  background: isPremium ? 'rgba(245,158,11,0.2)' : 'rgba(124,58,237,0.15)',
                  border: isPremium ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(124,58,237,0.3)',
                  color: isPremium ? '#F59E0B' : '#A78BFA',
                }}>
                {isPremium ? '⭐ Premium' : '⚡ Free'}
              </span>
            </button>
          )}
          {!user && (
            <button onClick={() => navigate('/profile')}
              className="mt-4 w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{ background:'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow:'0 4px 16px rgba(124,58,237,0.4)' }}>
              <Crown weight="fill" size={16}/> Sign In / Get Premium
            </button>
          )}
        </div>
      </div>

      {/* Sections grid */}
      <div className="max-w-7xl mx-auto px-5 mt-6 space-y-3">
        {SECTIONS.map(({ id, label, desc, icon: Icon, color, path, badge }) => (
          <button key={id} onClick={() => navigate(path)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5 group"
            style={{ background:'rgba(19,17,28,0.8)', border:'1px solid rgba(45,38,69,0.6)', boxShadow:'0 4px 16px rgba(0,0,0,0.3)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
              style={{ background:`${color}20`, border:`1px solid ${color}35` }}>
              <Icon weight="duotone" size={24} style={{ color }}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-white">{label}</p>
                {badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                    style={{
                      background: badge==='LIVE' ? 'rgba(239,68,68,0.85)' : 'rgba(124,58,237,0.85)',
                      color: '#fff',
                    }}>
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted mt-0.5 truncate">{desc}</p>
            </div>
            <span className="text-muted text-lg group-hover:text-white transition-colors">›</span>
          </button>
        ))}

        <p className="text-center text-[11px] text-muted py-4">
          Chillz v1.0 · Made for Uganda 🇺🇬
        </p>
      </div>
    </div>
  )
}

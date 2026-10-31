import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SoccerBall, MagnifyingGlass, X, ArrowClockwise, SpinnerGap, CalendarBlank } from '@phosphor-icons/react'
import { fetchLiveFixtures } from '../lib/sportsApi'
import staticData from '../data/sports_fixtures.json'
import type { Fixture } from '../data/types'

const STATIC_FIXTURES = staticData as Fixture[]

const STATUS_TABS = [
  { label: 'All',      value: 'all'      },
  { label: 'Live',     value: 'live'      },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Finished', value: 'finished' },
]

const TOP_LEAGUES = [
  { id: 4328, name: 'Premier League', logo: 'https://crests.football-data.org/PL.png',  color: '#3D1454' },
  { id: 4335, name: 'La Liga',        logo: 'https://crests.football-data.org/PD.png',  color: '#C60B1E' },
  { id: 4332, name: 'Serie A',        logo: 'https://crests.football-data.org/SA.png',  color: '#024494' },
  { id: 4480, name: 'Champions Lge',  logo: 'https://crests.football-data.org/CL.png',  color: '#1A478B' },
]

function sortFixtures(arr: Fixture[]) {
  const order: Record<string, number> = { IN_PLAY: 0, PAUSED: 1, TIMED: 2, SCHEDULED: 3, FINISHED: 4, CANCELLED: 5 }
  return [...arr].sort((a, b) => {
    const ao = order[a.status] ?? 9, bo = order[b.status] ?? 9
    if (ao !== bo) return ao - bo
    return new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime()
  })
}

export default function SportsPage() {
  const navigate = useNavigate()
  const [fixtures, setFixtures]       = useState<Fixture[]>(STATIC_FIXTURES)
  const [loading, setLoading]         = useState(true)
  const [liveLoaded, setLiveLoaded]   = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [search, setSearch]           = useState('')
  const [competition, setCompetition] = useState('All')
  const [statusTab, setStatusTab]     = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const live = await fetchLiveFixtures()
      if (live.length > 0) { setFixtures(live); setLiveLoaded(true); setLastUpdated(new Date()) }
    } catch { /* keep static */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i) }, [load])

  const competitions = useMemo(() =>
    ['All', ...Array.from(new Set(fixtures.map(f => f.competition_name))).sort()], [fixtures])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return sortFixtures(fixtures.filter(f => {
      const matchSearch = !q || f.home_team_name.toLowerCase().includes(q) ||
        f.away_team_name.toLowerCase().includes(q) || f.competition_name.toLowerCase().includes(q)
      const matchComp = competition === 'All' || f.competition_name === competition
      const matchStatus = statusTab === 'all' ||
        (statusTab === 'live' && (f.status === 'IN_PLAY' || f.status === 'PAUSED')) ||
        (statusTab === 'upcoming' && (f.status === 'SCHEDULED' || f.status === 'TIMED')) ||
        (statusTab === 'finished' && f.status === 'FINISHED')
      return matchSearch && matchComp && matchStatus
    }))
  }, [fixtures, search, competition, statusTab])

  const liveCount = fixtures.filter(f => f.status === 'IN_PLAY' || f.status === 'PAUSED').length

  return (
    <div className="bg-mesh min-h-screen pb-6">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[80px] opacity-15"
            style={{ background: 'radial-gradient(ellipse, #10b981, transparent)' }} />
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-[60px] opacity-10"
            style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent)' }} />
        </div>

        {/* Sports hero image strip */}
        <div className="relative h-44 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&auto=format&fit=crop&q=80"
            alt="Sports" className="w-full h-full object-cover opacity-40"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.6) 60%, rgba(10,10,15,0.3) 100%)'
          }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0A0A0F 0%, transparent 50%)' }} />

          <div className="absolute inset-0 flex flex-col justify-end px-5 pb-5">
            <div className="flex items-center gap-3 mb-2">
              {liveCount > 0 && (
                <span className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full live-dot" /> {liveCount} LIVE
                </span>
              )}
              <span className="text-[10px] text-muted">Champions League · Premier League · LaLiga · Serie A</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              <span className="gradient-text">Premier</span> League
            </h1>
            <p className="text-sm text-muted mt-0.5">Live. Anytime. Anywhere.</p>
            <button onClick={() => setStatusTab('live')}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white w-fit mt-3">
              Watch Live →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 space-y-6 pt-4">

        {/* ── Search + refresh ── */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass weight="bold" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input type="text" placeholder="Search teams or competitions…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-muted focus:outline-none transition-all"
              style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                <X weight="bold" size={13} />
              </button>
            )}
          </div>
          <button onClick={load} disabled={loading}
            className="w-10 h-10 rounded-xl border border-border bg-surface-2 flex items-center justify-center text-muted hover:text-white hover:border-primary/40 transition-all disabled:opacity-50">
            {loading ? <SpinnerGap weight="bold" size={15} className="animate-spin" /> : <ArrowClockwise weight="bold" size={15} />}
          </button>
        </div>

        {/* ── Status tabs ── */}
        <div className="flex items-center gap-1 p-1 rounded-2xl w-fit" style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
          {STATUS_TABS.map(t => (
            <button key={t.value} onClick={() => setStatusTab(t.value)}
              className="px-4 py-1.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: statusTab === t.value ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                color: statusTab === t.value ? '#fff' : '#7C7A91',
                boxShadow: statusTab === t.value ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
              }}>
              {t.value === 'live' && liveCount > 0 ? `🔴 Live (${liveCount})` : t.label}
            </button>
          ))}
        </div>

        {/* ── Competition pills ── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {competitions.slice(0, 15).map(c => (
            <button key={c} onClick={() => setCompetition(c)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
              style={{
                background: competition === c ? 'rgba(124,58,237,0.2)' : 'rgba(19,17,28,0.6)',
                border: `1px solid ${competition === c ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.6)'}`,
                color: competition === c ? '#A78BFA' : '#7C7A91',
              }}>
              {c}
            </button>
          ))}
        </div>

        {/* ── Status bar ── */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            <span className="text-white font-bold">{filtered.length}</span> fixtures
            {!liveLoaded && loading && <span className="ml-2 text-primary-light">· Updating…</span>}
          </p>
          {lastUpdated && (
            <p className="text-[10px] text-muted flex items-center gap-1">
              <CalendarBlank size={10} /> {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* ── Top Leagues ── */}
        <div className="grid grid-cols-4 gap-3">
          {TOP_LEAGUES.map(l => (
            <button key={l.id} onClick={() => setCompetition(l.name)}
              className="relative overflow-hidden rounded-2xl p-3 flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5 group"
              style={{ background: `${l.color}25`, border: `1px solid ${l.color}40` }}>
              <img src={l.logo} alt={l.name} className="w-8 h-8 object-contain drop-shadow-lg"
                onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
              <span className="text-[9px] font-bold text-white text-center">{l.name}</span>
            </button>
          ))}
        </div>

        {/* ── Fixtures ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <SoccerBall weight="duotone" size={40} className="text-muted mx-auto opacity-40" />
            <p className="text-muted font-medium">No fixtures match your filters</p>
            <button onClick={() => { setSearch(''); setCompetition('All'); setStatusTab('all') }}
              className="text-primary-light text-sm hover:underline">Clear filters</button>
          </div>
        ) : (
          <FixtureList fixtures={filtered} onSelect={f => navigate(`/sports/fixture/${f.id}`)} />
        )}
      </div>
    </div>
  )
}

function FixtureList({ fixtures, onSelect }: { fixtures: Fixture[]; onSelect: (f: Fixture) => void }) {
  const groups: Record<string, Fixture[]> = {}
  for (const f of fixtures) {
    if (!groups[f.competition_name]) groups[f.competition_name] = []
    groups[f.competition_name].push(f)
  }
  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([comp, matches]) => (
        <div key={comp}>
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px flex-1" style={{ background: 'rgba(45,38,69,0.6)' }} />
            <span className="text-[10px] font-black text-muted uppercase tracking-widest whitespace-nowrap">{comp}</span>
            <span className="h-px flex-1" style={{ background: 'rgba(45,38,69,0.6)' }} />
          </div>
          <div className="space-y-2">
            {matches.map(f => <FixtureRow key={f.id} fixture={f} onClick={() => onSelect(f)} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function FixtureRow({ fixture: f, onClick }: { fixture: Fixture; onClick: () => void }) {
  const isLive     = f.status === 'IN_PLAY' || f.status === 'PAUSED'
  const isFinished = f.status === 'FINISHED'
  const date       = new Date(f.utc_date)

  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border transition-all hover:-translate-y-0.5 group"
      style={{
        background: isLive ? 'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(19,17,28,0.95))' : 'rgba(19,17,28,0.7)',
        border: `1px solid ${isLive ? 'rgba(239,68,68,0.25)' : 'rgba(45,38,69,0.8)'}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}>
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Home */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img src={f.home_team_crest} alt="" className="w-7 h-7 object-contain shrink-0"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
          <span className={`text-sm font-bold truncate ${f.winner === 'HOME_TEAM' ? 'text-white' : isFinished ? 'text-muted' : 'text-white'}`}>
            {f.home_team_name}
          </span>
        </div>

        {/* Score / time */}
        <div className="shrink-0 text-center min-w-[80px]">
          {isLive ? (
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-red-400 tabular-nums">{f.home_score ?? 0}–{f.away_score ?? 0}</span>
              <span className="flex items-center gap-1 text-[9px] text-red-400 font-black tracking-wider">
                <span className="w-1 h-1 bg-red-500 rounded-full live-dot" /> LIVE
              </span>
            </div>
          ) : isFinished ? (
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-white tabular-nums">{f.home_score ?? 0}–{f.away_score ?? 0}</span>
              <span className="text-[9px] text-muted font-bold">FT</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-white tabular-nums">
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[9px] text-muted">
                {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className={`text-sm font-bold truncate text-right ${f.winner === 'AWAY_TEAM' ? 'text-white' : isFinished ? 'text-muted' : 'text-white'}`}>
            {f.away_team_name}
          </span>
          <img src={f.away_team_crest} alt="" className="w-7 h-7 object-contain shrink-0"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
        </div>
      </div>
    </button>
  )
}

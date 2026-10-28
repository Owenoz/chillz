import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SoccerBall, MagnifyingGlass, X, ArrowClockwise, SpinnerGap,
} from '@phosphor-icons/react'
import { fetchLiveFixtures } from '../lib/sportsApi'
import staticData from '../data/sports_fixtures.json'
import type { Fixture } from '../data/types'

// Use static JSON as the immediate fallback — never show empty
const STATIC_FIXTURES = staticData as Fixture[]

const STATUS_FILTERS = [
  { label: 'All',       value: 'all'      },
  { label: '🔴 Live',  value: 'live'      },
  { label: 'Upcoming',  value: 'upcoming' },
  { label: 'Finished',  value: 'finished' },
]

function sortFixtures(arr: Fixture[]) {
  const order: Record<string, number> = { IN_PLAY: 0, PAUSED: 1, TIMED: 2, SCHEDULED: 3, FINISHED: 4, CANCELLED: 5 }
  return [...arr].sort((a, b) => {
    const ao = order[a.status] ?? 9
    const bo = order[b.status] ?? 9
    if (ao !== bo) return ao - bo
    return new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime()
  })
}

export default function SportsPage() {
  const navigate = useNavigate()
  // Show static fixtures immediately — replaced by live data when it loads
  const [fixtures, setFixtures]         = useState<Fixture[]>(STATIC_FIXTURES)
  const [loading, setLoading]           = useState(true)
  const [liveLoaded, setLiveLoaded]     = useState(false)
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null)
  const [search, setSearch]             = useState('')
  const [competition, setCompetition]   = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const live = await fetchLiveFixtures()
      if (live.length > 0) {
        setFixtures(live)
        setLiveLoaded(true)
        setLastUpdated(new Date())
      }
    } catch {
      // keep static fixtures silently
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on mount + auto-refresh every 60s
  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

  const competitions = useMemo(() =>
    ['All', ...Array.from(new Set(fixtures.map(f => f.competition_name))).sort()],
    [fixtures]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const result = fixtures.filter(f => {
      const matchSearch = !q ||
        f.home_team_name.toLowerCase().includes(q) ||
        f.away_team_name.toLowerCase().includes(q) ||
        f.competition_name.toLowerCase().includes(q)
      const matchComp = competition === 'All' || f.competition_name === competition
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live'     && (f.status === 'IN_PLAY' || f.status === 'PAUSED')) ||
        (statusFilter === 'upcoming' && (f.status === 'SCHEDULED' || f.status === 'TIMED')) ||
        (statusFilter === 'finished' && f.status === 'FINISHED')
      return matchSearch && matchComp && matchStatus
    })
    return sortFixtures(result)
  }, [fixtures, search, competition, statusFilter])

  const liveCount     = fixtures.filter(f => f.status === 'IN_PLAY' || f.status === 'PAUSED').length
  const upcomingCount = fixtures.filter(f => f.status === 'SCHEDULED' || f.status === 'TIMED').length

  return (
    <div className="pb-24 md:pb-8">

      {/* ── Hero bar ── */}
      <div className="relative overflow-hidden border-b border-border/40"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(10,14,26,1) 60%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-48 rounded-full blur-[80px] opacity-10"
            style={{ background: 'radial-gradient(ellipse, #10b981, transparent)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {liveCount > 0 && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] text-red-400 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" /> {liveCount} Live
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">Live Sports</h1>
              <p className="text-gray-500 text-sm">
                <span className="text-white font-semibold">{fixtures.length}</span> fixtures ·{' '}
                <span className="text-white font-semibold">{upcomingCount}</span> upcoming
              </p>
            </div>
            {/* Refresh + last updated */}
            <div className="flex flex-col items-end gap-1.5">
              <button
                onClick={load}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-primary/40 text-gray-400 hover:text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {loading
                  ? <SpinnerGap weight="bold" size={12} className="animate-spin" />
                  : <ArrowClockwise weight="bold" size={12} />}
                Refresh
              </button>
              {lastUpdated && (
                <p className="text-[10px] text-gray-700">
                  Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Competition tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {competitions.slice(0, 18).map(c => (
            <button
              key={c}
              onClick={() => setCompetition(c)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                competition === c
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface border border-border text-gray-500 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ── Search + status ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass weight="bold" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search teams or competitions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                <X weight="bold" size={13} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1">
            {STATUS_FILTERS.map(sf => (
              <button
                key={sf.value}
                onClick={() => setStatusFilter(sf.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === sf.value
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-700">
          <span className="text-white font-semibold">{filtered.length}</span> fixtures
        </p>

        {/* ── Fixtures ── */}
        {loading && fixtures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <SpinnerGap weight="bold" size={32} className="text-primary animate-spin" />
            <p className="text-gray-500 text-sm">Loading live fixtures…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <SoccerBall weight="duotone" size={40} className="text-gray-700 mx-auto" />
            <p className="text-gray-600">No fixtures match your filters</p>
            <button onClick={() => { setSearch(''); setCompetition('All'); setStatusFilter('all') }} className="text-primary-light text-sm hover:underline">Clear filters</button>
          </div>
        ) : (
          <>
            {!liveLoaded && (
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <SpinnerGap weight="bold" size={12} className="animate-spin text-primary" />
                Updating to live data…
              </p>
            )}
            <FixtureList fixtures={filtered} onSelect={f => navigate(`/sports/fixture/${f.id}`)} />
          </>
        )}
      </div>
    </div>
  )
}

/* ── Fixture list grouped by competition ── */
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
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{comp}</span>
            <span className="flex-1 h-px bg-border/60" />
            <span className="text-[10px] text-gray-700">{matches.length}</span>
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
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 ${
        isLive
          ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
          : 'bg-surface border-white/6 hover:border-white/14'
      }`}
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
    >
      {/* Home */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <img src={f.home_team_crest} alt="" className="w-6 h-6 object-contain shrink-0"
          onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
        <span className={`text-sm font-semibold truncate tracking-tight ${
          f.winner === 'HOME_TEAM' ? 'text-white' : isFinished ? 'text-gray-500' : 'text-white'
        }`}>{f.home_team_name}</span>
      </div>

      {/* Score / time */}
      <div className="shrink-0 text-center min-w-[72px]">
        {isLive ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[17px] font-black text-red-400 tabular-nums">
              {f.home_score ?? 0}–{f.away_score ?? 0}
            </span>
            <span className="flex items-center gap-1 text-[9px] text-red-400 font-black tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" /> LIVE
            </span>
          </div>
        ) : isFinished ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[17px] font-black text-gray-300 tabular-nums">
              {f.home_score ?? 0}–{f.away_score ?? 0}
            </span>
            <span className="text-[9px] text-gray-600 font-bold">FT</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold text-gray-300 tabular-nums">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[9px] text-gray-600">
              {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* Away */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className={`text-sm font-semibold truncate text-right tracking-tight ${
          f.winner === 'AWAY_TEAM' ? 'text-white' : isFinished ? 'text-gray-500' : 'text-white'
        }`}>{f.away_team_name}</span>
        <img src={f.away_team_crest} alt="" className="w-6 h-6 object-contain shrink-0"
          onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SoccerBall } from '@phosphor-icons/react'
import fixturesData from '../data/sports_fixtures.json'
import type { Fixture } from '../data/types'

const allFixtures = fixturesData as Fixture[]

const COMPETITIONS = [
  'All',
  ...Array.from(new Set(allFixtures.map((f) => f.competition_name))).sort(),
]

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Live', value: 'live' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Finished', value: 'finished' },
]

export default function SportsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [competition, setCompetition] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    return allFixtures.filter((f) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        f.home_team_name.toLowerCase().includes(q) ||
        f.away_team_name.toLowerCase().includes(q) ||
        f.competition_name.toLowerCase().includes(q)
      const matchComp = competition === 'All' || f.competition_name === competition
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && f.status === 'IN_PLAY') ||
        (statusFilter === 'upcoming' && (f.status === 'SCHEDULED' || f.status === 'TIMED')) ||
        (statusFilter === 'finished' && f.status === 'FINISHED')
      return matchSearch && matchComp && matchStatus
    }).sort((a, b) => {
      // Live first, then upcoming, then finished
      const order = { IN_PLAY: 0, TIMED: 1, SCHEDULED: 2, FINISHED: 3, CANCELLED: 4 }
      const ao = order[a.status as keyof typeof order] ?? 5
      const bo = order[b.status as keyof typeof order] ?? 5
      if (ao !== bo) return ao - bo
      return new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime()
    })
  }, [search, competition, statusFilter])

  const liveCount = allFixtures.filter((f) => f.status === 'IN_PLAY').length
  const upcomingCount = allFixtures.filter((f) => f.status === 'SCHEDULED' || f.status === 'TIMED').length

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2 tracking-tight"><SoccerBall weight="duotone" size={22} className="text-primary-light" /> Live Sports</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {liveCount > 0 && (
            <span className="flex items-center gap-1.5 text-red-400 font-semibold">
              <span className="w-2 h-2 bg-red-500 rounded-full live-dot" />
              {liveCount} live now
            </span>
          )}
          <span>{upcomingCount} upcoming</span>
          <span>{allFixtures.filter((f) => f.status === 'FINISHED').length} finished</span>
        </div>
      </div>

      {/* Competitions quick-select */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {COMPETITIONS.slice(0, 15).map((c) => (
          <button
            key={c}
            onClick={() => setCompetition(c)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              competition === c
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-gray-400 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Search + status filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search teams or competitions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/60"
        />
        <div className="flex gap-2">
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setStatusFilter(sf.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === sf.value
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-gray-400 hover:text-white'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-4">{filtered.length} fixtures</p>

      {/* Fixtures grouped by competition */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No fixtures match your filters.</div>
      ) : (
        <FixtureList fixtures={filtered} onSelect={(f) => navigate(`/sports/fixture/${f.id}`)} />
      )}
    </div>
  )
}

function FixtureList({ fixtures, onSelect }: { fixtures: Fixture[]; onSelect: (f: Fixture) => void }) {
  // Group by competition
  const groups: Record<string, Fixture[]> = {}
  for (const f of fixtures) {
    if (!groups[f.competition_name]) groups[f.competition_name] = []
    groups[f.competition_name].push(f)
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([comp, matches]) => (
        <div key={comp}>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="flex-1 border-b border-border" />
            <span>{comp}</span>
            <span className="flex-1 border-b border-border" />
          </h2>
          <div className="space-y-2">
            {matches.map((f) => (
              <FixtureRow key={f.id} fixture={f} onClick={() => onSelect(f)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function FixtureRow({ fixture: f, onClick }: { fixture: Fixture; onClick: () => void }) {
  const isLive = f.status === 'IN_PLAY'
  const isFinished = f.status === 'FINISHED'
  const isUpcoming = f.status === 'SCHEDULED' || f.status === 'TIMED'
  const date = new Date(f.utc_date)

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-primary/40 ${
        isLive
          ? 'bg-red-950/20 border-red-900/40 hover:border-red-500/40'
          : 'bg-surface border-border'
      }`}
    >
      {/* Home team */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <img
          src={f.home_team_crest}
          alt=""
          className="w-6 h-6 object-contain shrink-0"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
        <span className={`text-sm font-semibold truncate ${f.winner === 'HOME_TEAM' ? 'text-white' : isFinished ? 'text-gray-400' : 'text-white'}`}>
          {f.home_team_name}
        </span>
      </div>

      {/* Score / time / status */}
      <div className="shrink-0 text-center w-24">
        {isLive ? (
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-red-400">
              {f.home_score ?? 0} – {f.away_score ?? 0}
            </span>
            <span className="flex items-center gap-1 text-[9px] text-red-400 font-bold mt-0.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot" /> LIVE
            </span>
          </div>
        ) : isFinished ? (
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-gray-300">
              {f.home_score ?? 0} – {f.away_score ?? 0}
            </span>
            <span className="text-[9px] text-gray-600 font-bold">FT</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-gray-300">
              {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[9px] text-gray-600">
              {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* Away team */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className={`text-sm font-semibold truncate text-right ${f.winner === 'AWAY_TEAM' ? 'text-white' : isFinished ? 'text-gray-400' : 'text-white'}`}>
          {f.away_team_name}
        </span>
        <img
          src={f.away_team_crest}
          alt=""
          className="w-6 h-6 object-contain shrink-0"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
      </div>

      {/* Matchday chip */}
      {isUpcoming && (
        <span className="hidden md:block shrink-0 text-[9px] text-gray-600 bg-surface-2 border border-border rounded px-1.5 py-0.5">
          MD{f.matchday}
        </span>
      )}
    </div>
  )
}

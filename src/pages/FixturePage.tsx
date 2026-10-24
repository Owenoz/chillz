import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, SpinnerGap, SoccerBall, Television } from '@phosphor-icons/react'
import { fetchFixtureById, fetchLiveFixtures } from '../lib/sportsApi'
import channelsData from '../data/tv_channels.json'
import type { Fixture, TvChannel } from '../data/types'

const allChannels = channelsData as TvChannel[]

function findRelatedChannels(): TvChannel[] {
  const keywords = ['sport', 'sports', 'football', 'soccer']
  return allChannels
    .filter(c => c.active && keywords.some(kw => c.title.toLowerCase().includes(kw)))
    .slice(0, 6)
}

export default function FixturePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [fixture, setFixture] = useState<Fixture | null>(null)
  const [related, setRelated] = useState<Fixture[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)

    fetchFixtureById(Number(id))
      .then(async found => {
        if (found) {
          setFixture(found)
          // Fetch related from same competition
          const all = await fetchLiveFixtures().catch(() => [])
          const rel = all
            .filter(f => f.id !== found.id && f.competition_name === found.competition_name)
            .sort((a, b) => new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime())
            .slice(0, 8)
          setRelated(rel)
        } else {
          // Fallback to static
          const { default: staticData } = await import('../data/sports_fixtures.json')
          const f = (staticData as Fixture[]).find(f => String(f.id) === id)
          setFixture(f || null)
        }
      })
      .catch(async () => {
        const { default: staticData } = await import('../data/sports_fixtures.json')
        const f = (staticData as Fixture[]).find(f => String(f.id) === id)
        setFixture(f || null)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SpinnerGap weight="bold" size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  if (!fixture) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <SoccerBall weight="duotone" size={48} className="text-gray-700" />
        <p className="text-white font-semibold">Fixture not found</p>
        <button onClick={() => navigate('/sports')} className="text-primary-light hover:underline text-sm flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back to sports
        </button>
      </div>
    )
  }

  const isLive     = fixture.status === 'IN_PLAY' || fixture.status === 'PAUSED'
  const isFinished = fixture.status === 'FINISHED'
  const date       = new Date(fixture.utc_date)
  const relatedChannels = findRelatedChannels()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-5">
      <button onClick={() => navigate('/sports')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors group">
        <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to sports
      </button>

      {/* Main match card */}
      <div className={`rounded-2xl border p-6 md:p-8 ${
        isLive ? 'bg-red-500/5 border-red-500/20' : 'bg-surface border-white/6'
      }`} style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>

        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-bold text-primary-light">{fixture.competition_name}</span>
          {isLive ? (
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full live-dot" /> LIVE
            </span>
          ) : (
            <span className="text-sm text-gray-500">
              {isFinished
                ? 'Full Time'
                : date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex flex-col items-center gap-3 text-center">
            <img src={fixture.home_team_crest} alt={fixture.home_team_name}
              className="w-20 h-20 object-contain"
              onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
            <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{fixture.home_team_name}</h2>
            {fixture.winner === 'HOME_TEAM' && (
              <span className="text-[10px] bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">WINNER</span>
            )}
          </div>

          <div className="shrink-0 text-center px-4">
            {isLive || isFinished ? (
              <div>
                <div className={`text-5xl font-black tabular-nums ${isLive ? 'text-red-400' : 'text-white'}`}>
                  {fixture.home_score ?? 0}
                  <span className="text-gray-600 mx-2">–</span>
                  {fixture.away_score ?? 0}
                </div>
                {isFinished && fixture.winner === 'DRAW' && (
                  <p className="text-xs text-gray-500 mt-1">Draw</p>
                )}
              </div>
            ) : (
              <div>
                <div className="text-4xl font-black text-gray-400 tabular-nums">
                  {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-3 text-center">
            <img src={fixture.away_team_crest} alt={fixture.away_team_name}
              className="w-20 h-20 object-contain"
              onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
            <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{fixture.away_team_name}</h2>
            {fixture.winner === 'AWAY_TEAM' && (
              <span className="text-[10px] bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">WINNER</span>
            )}
          </div>
        </div>

        {/* Meta */}
        {(fixture.venue || fixture.city || fixture.matchday || fixture.stage) && (
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-border/40 text-xs text-gray-600">
            {fixture.venue    && <span>🏟 {fixture.venue}</span>}
            {fixture.city     && <span>📍 {fixture.city}</span>}
            {fixture.matchday && <span>Matchday {fixture.matchday}</span>}
            {fixture.stage    && <span>{fixture.stage}</span>}
          </div>
        )}
      </div>

      {/* Watch on these channels */}
      {relatedChannels.length > 0 && (
        <div className="bg-surface border border-white/6 rounded-2xl p-4"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Television weight="duotone" size={15} className="text-primary-light" />
            Watch Live On
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {relatedChannels.map(ch => (
              <button key={ch.id} onClick={() => navigate(`/tv/watch/${ch.id}`)}
                className="flex items-center gap-2 p-2.5 bg-surface-2 rounded-xl hover:border-primary/40 border border-white/6 transition-all text-left group">
                <div className="w-10 h-8 rounded-lg overflow-hidden bg-bg shrink-0">
                  {ch.poster_url
                    ? <img src={ch.poster_url} alt={ch.title} className="w-full h-full object-cover"
                        onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                    : <div className="w-full h-full flex items-center justify-center"><Television weight="duotone" size={14} className="text-gray-700" /></div>}
                </div>
                <span className="text-xs font-semibold text-white truncate group-hover:text-primary-light transition-colors">{ch.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related fixtures */}
      {related.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3">More in {fixture.competition_name}</h3>
          <div className="space-y-2">
            {related.map(f => {
              const isL = f.status === 'IN_PLAY'
              const isF = f.status === 'FINISHED'
              const d   = new Date(f.utc_date)
              return (
                <div key={f.id} onClick={() => navigate(`/sports/fixture/${f.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-white/6 hover:border-white/14 cursor-pointer transition-all">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img src={f.home_team_crest} alt="" className="w-5 h-5 object-contain shrink-0"
                      onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                    <span className="text-xs font-medium text-white truncate">{f.home_team_name}</span>
                  </div>
                  <div className="shrink-0 text-xs font-bold text-center w-20">
                    {isL ? <span className="text-red-400">{f.home_score}–{f.away_score}</span>
                         : isF ? <span className="text-gray-300">{f.home_score}–{f.away_score} FT</span>
                         : <span className="text-gray-500">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-xs font-medium text-white truncate text-right">{f.away_team_name}</span>
                    <img src={f.away_team_crest} alt="" className="w-5 h-5 object-contain shrink-0"
                      onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

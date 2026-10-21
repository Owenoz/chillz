import { useParams, useNavigate } from 'react-router-dom'
import fixturesData from '../data/sports_fixtures.json'
import channelsData from '../data/tv_channels.json'
import type { Fixture, TvChannel } from '../data/types'

const allFixtures = fixturesData as Fixture[]
const allChannels = channelsData as TvChannel[]

// Keywords to match sports channels for a given fixture
function findRelatedChannels(fixture: Fixture): TvChannel[] {
  const keywords = [
    fixture.competition_name.toLowerCase().replace(/\s+/g, ' '),
    fixture.home_team_name.toLowerCase(),
    fixture.away_team_name.toLowerCase(),
    'sport', 'sports', 'football', 'soccer',
  ]
  return allChannels
    .filter((c) => c.active && keywords.some((kw) => c.title.toLowerCase().includes(kw.slice(0, 6))))
    .slice(0, 6)
}

export default function FixturePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const fixture = allFixtures.find((f) => String(f.id) === id)
  if (!fixture) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <p className="text-4xl mb-3">⚽</p>
        <p>Fixture not found</p>
        <button onClick={() => navigate('/sports')} className="mt-4 text-primary-light hover:underline text-sm">
          ← Back to sports
        </button>
      </div>
    )
  }

  const isLive = fixture.status === 'IN_PLAY'
  const isFinished = fixture.status === 'FINISHED'
  const date = new Date(fixture.utc_date)
  const relatedChannels = findRelatedChannels(fixture)

  const related = allFixtures
    .filter(
      (f) =>
        f.id !== fixture.id &&
        (f.competition_name === fixture.competition_name ||
          f.home_team_id === fixture.home_team_id ||
          f.away_team_id === fixture.away_team_id)
    )
    .sort((a, b) => new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime())
    .slice(0, 8)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      <button
        onClick={() => navigate('/sports')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
      >
        ← Back to sports
      </button>

      {/* Main match card */}
      <div className={`rounded-2xl border p-6 md:p-8 ${isLive ? 'bg-red-950/20 border-red-900/40' : 'bg-surface border-border'}`}>
        {/* Competition + date */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-semibold text-primary-light">{fixture.competition_name}</span>
          {isLive ? (
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full live-dot" /> LIVE
            </span>
          ) : (
            <span className="text-sm text-gray-500">
              {isFinished ? 'Full Time' : date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="flex items-center justify-between gap-4">
          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-3 text-center">
            <img
              src={fixture.home_team_crest}
              alt={fixture.home_team_name}
              className="w-20 h-20 object-contain"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            />
            <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{fixture.home_team_name}</h2>
            {fixture.winner === 'HOME_TEAM' && (
              <span className="text-[10px] bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">WINNER</span>
            )}
          </div>

          {/* Score */}
          <div className="shrink-0 text-center px-4">
            {isLive || isFinished ? (
              <div>
                <div className={`text-5xl font-black ${isLive ? 'text-red-400' : 'text-white'}`}>
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
                <div className="text-4xl font-black text-gray-400">
                  {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-3 text-center">
            <img
              src={fixture.away_team_crest}
              alt={fixture.away_team_name}
              className="w-20 h-20 object-contain"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            />
            <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{fixture.away_team_name}</h2>
            {fixture.winner === 'AWAY_TEAM' && (
              <span className="text-[10px] bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">WINNER</span>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-border text-xs text-gray-600">
          {fixture.venue && <span>🏟 {fixture.venue}</span>}
          {fixture.city && <span>📍 {fixture.city}</span>}
          {fixture.matchday && <span>Matchday {fixture.matchday}</span>}
          {fixture.stage && <span>{fixture.stage}</span>}
        </div>
      </div>

      {/* Watch live on these channels */}
      {relatedChannels.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h3 className="text-sm font-bold text-gray-300 mb-3">📺 Watch live on</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {relatedChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => navigate(`/tv/watch/${ch.id}`)}
                className="flex items-center gap-2 p-2.5 bg-surface-2 rounded-xl hover:border-primary/40 border border-border transition-colors text-left"
              >
                <div className="w-10 h-8 rounded overflow-hidden bg-bg shrink-0">
                  {ch.poster_url ? (
                    <img src={ch.poster_url} alt={ch.title} className="w-full h-full object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm">📺</div>
                  )}
                </div>
                <span className="text-xs font-medium text-white truncate">{ch.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related fixtures */}
      {related.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3">Related Fixtures</h3>
          <div className="space-y-2">
            {related.map((f) => {
              const isL = f.status === 'IN_PLAY'
              const isF = f.status === 'FINISHED'
              const d = new Date(f.utc_date)
              return (
                <div
                  key={f.id}
                  onClick={() => navigate(`/sports/fixture/${f.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-primary/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img src={f.home_team_crest} alt="" className="w-5 h-5 object-contain shrink-0" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                    <span className="text-xs font-medium text-white truncate">{f.home_team_name}</span>
                  </div>
                  <div className="shrink-0 text-xs font-bold text-center w-20">
                    {isL ? <span className="text-red-400">{f.home_score}–{f.away_score}</span>
                      : isF ? <span className="text-gray-300">{f.home_score}–{f.away_score} FT</span>
                      : <span className="text-gray-500">{d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-xs font-medium text-white truncate text-right">{f.away_team_name}</span>
                    <img src={f.away_team_crest} alt="" className="w-5 h-5 object-contain shrink-0" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
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

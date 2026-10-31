import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { Play, ArrowRight, Television, SoccerBall, FilmSlate, Star } from '@phosphor-icons/react'
import channels from '../data/tv_channels.json'
import type { TvChannel, Fixture } from '../data/types'
import { fetchLiveFixtures } from '../lib/sportsApi'
import staticFixtures from '../data/sports_fixtures.json'

const allChannels = channels as TvChannel[]
const ugandaChannels = allChannels.filter(c => c.active && c.poster_url && c.country === 'Uganda')
  .sort((a, b) => a.display_order - b.display_order)
const popularChannels = [
  ...ugandaChannels,
  ...allChannels.filter(c => c.active && c.poster_url && c.country !== 'Uganda')
    .sort((a, b) => a.display_order - b.display_order),
].slice(0, 18)
const heroSlides = ugandaChannels.slice(0, 6)

// Trending movies (static posters for display)
const TRENDING = [
  { title: 'John Wick', year: 2023, rating: 7.4, genre: 'Action', poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&auto=format&fit=crop&q=80' },
  { title: 'The Batman', year: 2022, rating: 7.8, genre: 'Action', poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&auto=format&fit=crop&q=80' },
  { title: 'Oppenheimer', year: 2023, rating: 8.4, genre: 'Drama', poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop&q=80' },
  { title: 'Venom', year: 2024, rating: 6.6, genre: 'Action', poster: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&auto=format&fit=crop&q=80' },
]

const TOP_LEAGUES = [
  { name: 'Premier League', logo: 'https://crests.football-data.org/PL.png' },
  { name: 'La Liga', logo: 'https://crests.football-data.org/PD.png' },
  { name: 'Serie A', logo: 'https://crests.football-data.org/SA.png' },
  { name: 'Champions League', logo: 'https://crests.football-data.org/CL.png' },
]

function timeUntil(utcDate: string): string {
  const diff = new Date(utcDate).getTime() - Date.now()
  if (diff <= 0) return 'Now'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function HomePage() {
  const navigate = useNavigate()
  const [heroIdx, setHeroIdx] = useState(0)
  const [fixtures, setFixtures] = useState<Fixture[]>(staticFixtures as Fixture[])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (heroSlides.length < 2) return
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroSlides.length), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const loadFixtures = useCallback(async () => {
    try {
      const data = await fetchLiveFixtures()
      if (data.length > 0) setFixtures(data)
    } catch { /* silent */ }
  }, [])
  useEffect(() => { loadFixtures() }, [loadFixtures])

  const hero = heroSlides[heroIdx] ?? heroSlides[0]
  const liveFixtures = fixtures.filter(f => f.status === 'IN_PLAY' || f.status === 'PAUSED').slice(0, 4)
  const upcomingFixtures = fixtures.filter(f => f.status === 'SCHEDULED' || f.status === 'TIMED')
    .sort((a, b) => new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime()).slice(0, 4)
  const matchesToShow = liveFixtures.length > 0 ? liveFixtures : upcomingFixtures

  void tick

  return (
    <div className="bg-mesh min-h-screen pb-6">

      {/* ══ HERO ══ */}
      {hero && (
        <div className="relative overflow-hidden" style={{ minHeight: 340, maxHeight: 460 }}>
          {heroSlides.map((slide, i) => (
            <div key={slide.id} className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === heroIdx ? 1 : 0 }}>
              <img src={slide.poster_url!} alt={slide.title}
                className="w-full h-full object-cover"
                onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
            </div>
          ))}
          {/* Multi-layer overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,10,15,0.96) 0%, rgba(10,10,15,0.7) 55%, rgba(10,10,15,0.3) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0A0A0F 0%, transparent 55%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 30% 50%, rgba(124,58,237,0.12), transparent 70%)' }} />

          <div className="relative h-full flex flex-col justify-end px-5 pb-8 md:px-8" style={{ minHeight: 340 }}>
            <p className="text-[10px] font-black tracking-[0.2em] text-primary-light uppercase mb-2 flex items-center gap-1.5">
              <Television weight="fill" size={10} /> CHILLZ TV · LIVE
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight mb-1 max-w-lg">
              DREAM<br />
              <span className="gradient-text">BIGGER</span>
            </h1>
            <p className="text-sm text-muted mb-5 font-medium">Watch · Chill · Repeat</p>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(`/tv/watch/${hero.id}`)} className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
                <Play weight="fill" size={14} /> Watch Now
              </button>
              <button onClick={() => navigate('/tv')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/20 bg-white/8 hover:bg-white/12 transition-all backdrop-blur-sm">
                All Channels
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5 mt-5">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)}
                  className="rounded-full transition-all"
                  style={{ width: i === heroIdx ? 22 : 6, height: 6,
                    background: i === heroIdx ? '#7C3AED' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pt-8">

        {/* ══ LIVE TV ROW ══ */}
        <section>
          <SectionHeader title="Live TV" sub="TAP TO WATCH" icon={<Television weight="duotone" size={14} className="text-primary-light" />}
            onSeeAll={() => navigate('/tv')} />
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar mt-4">
            {popularChannels.map(ch => (
              <button key={ch.id} onClick={() => navigate(`/tv/watch/${ch.id}`)}
                className="shrink-0 flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-border group-hover:border-primary/50 transition-all relative channel-glow"
                  style={{ background: '#13111C' }}>
                  {ch.poster_url ? (
                    <img src={ch.poster_url} alt={ch.title} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Television weight="duotone" size={24} className="text-primary-light opacity-60" />
                    </div>
                  )}
                  <div className="absolute bottom-0.5 left-0.5 bg-red-600 text-white text-[7px] font-black px-1 py-0.5 rounded-sm tracking-wider">
                    LIVE
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-muted group-hover:text-white transition-colors w-16 text-center truncate">
                  {ch.title.replace(/ Uganda$/, '').replace(/ TV$/, '')}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ══ TRENDING MOVIES ══ */}
        <section>
          <SectionHeader title="Trending Movies" icon={<FilmSlate weight="duotone" size={14} className="text-accent" />}
            onSeeAll={() => navigate('/movies')} />
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar mt-4">
            {TRENDING.map(m => (
              <button key={m.title} onClick={() => navigate('/movies')}
                className="shrink-0 w-28 group text-left">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2"
                  style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  <img src={m.poster} alt={m.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-lg">
                    <Star weight="fill" size={9} className="text-amber-400" />
                    <span className="text-[9px] font-bold text-white">{m.rating}</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center shadow-glow-sm">
                      <Play weight="fill" size={14} className="text-white translate-x-0.5" />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-white truncate">{m.title}</p>
                <p className="text-[10px] text-muted">{m.genre}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ══ LIVE & UPCOMING MATCHES ══ */}
        {matchesToShow.length > 0 && (
          <section>
            <SectionHeader
              title={liveFixtures.length > 0 ? 'Live & upcoming matches' : 'Upcoming Matches'}
              sub="FOOTBALL"
              icon={<SoccerBall weight="duotone" size={14} className="text-emerald-400" />}
              desc="Champions League, Premier League, LaLiga, Serie A & more"
              onSeeAll={() => navigate('/sports')}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {matchesToShow.map(f => (
                <MatchCard key={f.id} fixture={f} onClick={() => navigate(`/sports/fixture/${f.id}`)} />
              ))}
            </div>

            {/* Top Leagues pills */}
            <div className="mt-5">
              <p className="text-[10px] font-black tracking-[0.15em] text-muted uppercase mb-3">Top Leagues</p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {TOP_LEAGUES.map(l => (
                  <button key={l.name} onClick={() => navigate('/sports')}
                    className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-border hover:border-primary/40 transition-all group">
                    <img src={l.logo} alt={l.name} className="w-5 h-5 object-contain"
                      onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                    <span className="text-[11px] font-semibold text-muted group-hover:text-white transition-colors whitespace-nowrap">
                      {l.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ QUICK ACCESS TILES ══ */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Live TV', sub: `${allChannels.filter(c=>c.active).length}+ channels`, color: '#7C3AED', icon: <Television weight="fill" size={22} />, path: '/tv' },
            { label: 'Sports', sub: 'Live fixtures', color: '#10B981', icon: <SoccerBall weight="fill" size={22} />, path: '/sports' },
            { label: 'Movies', sub: '28k+ films', color: '#F59E0B', icon: <FilmSlate weight="fill" size={22} />, path: '/movies' },
          ].map(t => (
            <button key={t.label} onClick={() => navigate(t.path)}
              className="relative overflow-hidden rounded-2xl p-4 flex flex-col items-start gap-3 transition-all hover:-translate-y-0.5 group"
              style={{ background: `linear-gradient(135deg, ${t.color}22, ${t.color}08)`, border: `1px solid ${t.color}30` }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(ellipse at top left, ${t.color}20, transparent 70%)` }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: `${t.color}25`, border: `1px solid ${t.color}35` }}>
                <span style={{ color: t.color }}>{t.icon}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">{t.label}</p>
                <p className="text-[10px] text-muted">{t.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ══ UGANDA CHANNELS GRID ══ */}
        <section>
          <SectionHeader title="🇺🇬 Uganda Channels" sub="LOCAL" onSeeAll={() => navigate('/tv')} />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
            {ugandaChannels.slice(0, 12).map(ch => (
              <button key={ch.id} onClick={() => navigate(`/tv/watch/${ch.id}`)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface hover:border-primary/40 transition-all hover:-translate-y-0.5 channel-glow">
                <div className="aspect-video relative overflow-hidden">
                  <img src={ch.poster_url!} alt={ch.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
                    onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary shadow-glow-sm flex items-center justify-center">
                      <Play weight="fill" size={12} className="text-white translate-x-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-1 left-1 bg-red-600 text-white text-[7px] font-black px-1 py-0.5 rounded-sm flex items-center gap-0.5">
                    <span className="w-1 h-1 bg-white rounded-full live-dot" /> LIVE
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-bold text-white truncate">{ch.title}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

/* ── Section Header ── */
function SectionHeader({ title, sub, icon, desc, onSeeAll }: {
  title: string; sub?: string; icon?: React.ReactNode
  desc?: string; onSeeAll?: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        {sub && (
          <p className="text-[9px] font-black tracking-[0.2em] text-muted uppercase mb-1 flex items-center gap-1.5">
            {icon}{sub}
          </p>
        )}
        <h2 className="text-[17px] font-black text-white tracking-tight">{title}</h2>
        {desc && <p className="text-[11px] text-muted mt-0.5">{desc}</p>}
      </div>
      {onSeeAll && (
        <button onClick={onSeeAll} className="flex items-center gap-1 text-[12px] font-semibold text-primary-light hover:text-white transition-colors whitespace-nowrap mt-1">
          See all <ArrowRight size={12} />
        </button>
      )}
    </div>
  )
}

/* ── Match Card ── */
function MatchCard({ fixture: f, onClick }: { fixture: Fixture; onClick: () => void }) {
  const isLive = f.status === 'IN_PLAY' || f.status === 'PAUSED'
  const isFinished = f.status === 'FINISHED'
  const date = new Date(f.utc_date)
  const today = date.toDateString() === new Date().toDateString()

  return (
    <button onClick={onClick}
      className="relative overflow-hidden rounded-2xl border text-left transition-all hover:-translate-y-0.5 group w-full"
      style={{
        background: isLive
          ? 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(19,17,28,0.95))'
          : 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(19,17,28,0.95))',
        border: `1px solid ${isLive ? 'rgba(239,68,68,0.25)' : 'rgba(45,38,69,0.8)'}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}>
      {/* Background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.1), transparent 70%)' }} />

      <div className="relative p-3">
        {/* Top: date + status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-bold text-muted">
            {today ? 'TODAY' : date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            {' · '}{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isLive && (
            <span className="flex items-center gap-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
              <span className="w-1 h-1 bg-white rounded-full live-dot" /> LIVE
            </span>
          )}
          {!isLive && !isFinished && (
            <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-400/10 px-1.5 py-0.5 rounded-md">
              UPCOMING
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <img src={f.home_team_crest} alt="" className="w-10 h-10 object-contain drop-shadow-lg"
              onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
            <span className="text-[10px] font-bold text-white text-center line-clamp-1 w-full">
              {f.home_team_name.split(' ').slice(0,2).join(' ')}
            </span>
          </div>

          <div className="flex flex-col items-center gap-0.5 px-1">
            {isLive || isFinished ? (
              <span className={`text-lg font-black tabular-nums ${isLive ? 'text-red-400' : 'text-white'}`}>
                {f.home_score ?? 0}–{f.away_score ?? 0}
              </span>
            ) : (
              <span className="text-[11px] font-black text-muted">VS</span>
            )}
            {isFinished && <span className="text-[8px] text-muted font-bold">FT</span>}
          </div>

          <div className="flex flex-col items-center gap-1.5 flex-1">
            <img src={f.away_team_crest} alt="" className="w-10 h-10 object-contain drop-shadow-lg"
              onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
            <span className="text-[10px] font-bold text-white text-center line-clamp-1 w-full">
              {f.away_team_name.split(' ').slice(0,2).join(' ')}
            </span>
          </div>
        </div>

        <p className="text-[9px] text-muted font-semibold text-center mt-2 truncate">{f.competition_name}</p>
        {!isLive && !isFinished && (
          <p className="text-[9px] text-emerald-400 text-center mt-0.5">
            🕐 Starts in {timeUntil(f.utc_date)}
          </p>
        )}
      </div>
    </button>
  )
}

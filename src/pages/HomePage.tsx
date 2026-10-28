import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import {
  Television, SoccerBall, FilmSlate, Play,
  ArrowRight, Lightning, RadioButton,
} from '@phosphor-icons/react'
import channels from '../data/tv_channels.json'
import type { TvChannel } from '../data/types'
import { fetchLiveFixtures } from '../lib/sportsApi'
import type { Fixture } from '../data/types'

const allChannels = channels as TvChannel[]

// Uganda channels first (with poster), then others with poster
const ugandaChannels = allChannels
  .filter(c => c.active && c.poster_url && c.country === 'Uganda')
  .sort((a, b) => a.display_order - b.display_order)

const popularChannels = [
  ...ugandaChannels,
  ...allChannels.filter(c => c.active && c.poster_url && c.country !== 'Uganda')
    .sort((a, b) => a.display_order - b.display_order),
].slice(0, 20)

// Hero slides: Uganda channels with poster
const heroSlides = ugandaChannels.slice(0, 6)

function timeUntil(utcDate: string): string {
  const diff = new Date(utcDate).getTime() - Date.now()
  if (diff <= 0) return 'Now'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `Starts in ${h}h ${m}m ${s}s`
  if (m > 0) return `Starts in ${m}m ${s}s`
  return `Starts in ${s}s`
}

export default function HomePage() {
  const navigate = useNavigate()
  const [heroIdx, setHeroIdx] = useState(0)
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [tick, setTick] = useState(0)

  // Auto-advance hero every 4s
  useEffect(() => {
    if (heroSlides.length < 2) return
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroSlides.length), 4000)
    return () => clearInterval(t)
  }, [])

  // Tick every second for countdown
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Load fixtures
  const loadFixtures = useCallback(async () => {
    try {
      const data = await fetchLiveFixtures()
      setFixtures(data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => { loadFixtures() }, [loadFixtures])

  const hero = heroSlides[heroIdx] ?? heroSlides[0]

  const liveMatches = fixtures
    .filter(f => f.status === 'IN_PLAY' || f.status === 'PAUSED')
    .slice(0, 8)

  const upcomingMatches = fixtures
    .filter(f => f.status === 'SCHEDULED' || f.status === 'TIMED')
    .sort((a, b) => new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime())
    .slice(0, 8)

  const matchesToShow = liveMatches.length > 0 ? liveMatches : upcomingMatches

  return (
    <div className="pb-24 md:pb-10 bg-[#0a0e1a] min-h-screen">

      {/* ══════════════════════════════════════
          HERO SLIDESHOW
      ══════════════════════════════════════ */}
      {hero && (
        <section className="relative w-full overflow-hidden" style={{ aspectRatio: '16/7', maxHeight: 480, minHeight: 260 }}>
          {/* Background image */}
          {heroSlides.map((slide, i) => (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === heroIdx ? 1 : 0 }}
            >
              <img
                src={slide.poster_url!}
                alt={slide.title}
                className="w-full h-full object-cover"
                onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to right, rgba(10,14,26,0.92) 0%, rgba(10,14,26,0.6) 50%, rgba(10,14,26,0.2) 100%)'
              }} />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(10,14,26,1) 0%, transparent 50%)'
              }} />
            </div>
          ))}

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end px-5 pb-8 md:px-10 md:pb-10">
            <div className="max-w-lg">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 bg-white rounded-full live-dot" /> LIVE NOW
                </span>
                <span className="text-[10px] font-semibold text-gray-400 bg-white/8 border border-white/10 px-2.5 py-1 rounded-md">
                  200+ free channels
                </span>
              </div>

              {/* Source label */}
              <p className="text-[10px] font-black tracking-[0.15em] text-primary-light uppercase flex items-center gap-1.5 mb-2">
                <Television weight="duotone" size={11} /> CHILLZ TV
              </p>

              {/* Title */}
              <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-1">
                {hero.title}
              </h2>
              {hero.description && hero.description !== hero.title && (
                <p className="text-sm text-gray-400 mt-1 mb-4 line-clamp-1">{hero.description}</p>
              )}

              {/* CTAs */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => navigate(`/tv/watch/${hero.id}`)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', boxShadow: '0 8px 24px rgba(108,99,255,0.4)' }}
                >
                  <Play weight="fill" size={14} /> Watch live
                </button>
                <button
                  onClick={() => navigate('/tv')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all backdrop-blur-sm"
                >
                  All channels
                </button>
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5 mt-5">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIdx(i)}
                  className="transition-all rounded-full"
                  style={{
                    width: i === heroIdx ? 20 : 6,
                    height: 6,
                    background: i === heroIdx ? '#6c63ff' : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 pt-8">

        {/* ══════════════════════════════════════
            POPULAR CHANNELS
        ══════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black tracking-[0.15em] text-gray-500 uppercase mb-0.5">TAP TO WATCH</p>
              <h2 className="text-xl font-black text-white tracking-tight">Popular channels</h2>
            </div>
            <button
              onClick={() => navigate('/tv')}
              className="flex items-center gap-1.5 text-sm font-semibold text-primary-light hover:text-white transition-colors"
            >
              See all <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {popularChannels.map(ch => (
              <div key={ch.id} className="shrink-0 w-36 sm:w-40">
                <ChannelCard channel={ch} onClick={() => navigate(`/tv/watch/${ch.id}`)} />
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════
            LIVE & UPCOMING MATCHES
        ══════════════════════════════════════ */}
        {matchesToShow.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black tracking-[0.15em] text-gray-500 uppercase mb-0.5 flex items-center gap-1.5">
                  <SoccerBall weight="duotone" size={11} className="text-emerald-400" /> FOOTBALL
                </p>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {liveMatches.length > 0 ? 'Live matches' : 'Live & upcoming matches'}
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Champions League, Premier League, LaLiga, Serie A & more — free to watch on Chillz
                </p>
              </div>
              <button
                onClick={() => navigate('/sports')}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary-light hover:text-white transition-colors whitespace-nowrap"
              >
                All matches <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {matchesToShow.map(f => (
                <MatchCard key={f.id} fixture={f} onClick={() => navigate(`/sports/fixture/${f.id}`)} tick={tick} />
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════
            STATS BAR
        ══════════════════════════════════════ */}
        <div className="grid grid-cols-3 divide-x divide-border/60 border border-border/60 rounded-2xl overflow-hidden">
          {[
            { Icon: RadioButton, value: `${allChannels.filter(c=>c.active).length}+`, label: 'Live Channels' },
            { Icon: SoccerBall,  value: `${fixtures.length || '—'}`,                label: 'Fixtures'      },
            { Icon: Television,  value: `${ugandaChannels.length}+`,                label: 'Uganda Channels' },
          ].map(({ Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center py-5 gap-1 bg-surface/40">
              <Icon weight="duotone" size={15} className="text-primary-light mb-1 opacity-60" />
              <span className="text-2xl font-black text-white tracking-tight">{value}</span>
              <span className="text-[10px] text-gray-600 uppercase tracking-widest font-medium text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════
            FEATURE TILES
        ══════════════════════════════════════ */}
        <section className="grid md:grid-cols-3 gap-3">
          {[
            {
              icon: <Television weight="duotone" size={22} />,
              title: 'Live TV',
              desc: `${allChannels.filter(c=>c.active).length}+ channels. Uganda, sports, news, entertainment.`,
              color: '#6c63ff',
              path: '/tv',
            },
            {
              icon: <SoccerBall weight="duotone" size={22} />,
              title: 'Live Sports',
              desc: 'Premier League, La Liga, Serie A, Champions League & more.',
              color: '#10b981',
              path: '/sports',
            },
            {
              icon: <FilmSlate weight="duotone" size={22} />,
              title: 'Free Movies',
              desc: '28,000+ public domain films. Stream or download free.',
              color: '#38bdf8',
              path: '/movies',
            },
          ].map(({ icon, title, desc, color, path }) => (
            <div
              key={title}
              onClick={() => navigate(path)}
              className="group relative overflow-hidden rounded-2xl border border-white/6 bg-surface p-6 cursor-pointer transition-all hover:-translate-y-1 hover:border-white/12"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(ellipse at top left, ${color}18, transparent 60%)` }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white"
                style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                {icon}
              </div>
              <h3 className="font-bold text-white text-[15px] mb-1.5 tracking-tight">{title}</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-5">{desc}</p>
              <span className="flex items-center gap-1 text-[12px] font-semibold group-hover:gap-2 transition-all" style={{ color }}>
                Open <ArrowRight size={12} />
              </span>
            </div>
          ))}
        </section>

        {/* ══════════════════════════════════════
            UGANDA CHANNELS SECTION
        ══════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black tracking-[0.15em] text-gray-500 uppercase mb-0.5">🇺🇬 LOCAL</p>
              <h2 className="text-xl font-black text-white tracking-tight">Uganda Channels</h2>
            </div>
            <button onClick={() => navigate('/tv')} className="flex items-center gap-1.5 text-sm font-semibold text-primary-light hover:text-white transition-colors">
              See all <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ugandaChannels.slice(0, 12).map(ch => (
              <div
                key={ch.id}
                onClick={() => navigate(`/tv/watch/${ch.id}`)}
                className="group relative overflow-hidden rounded-xl border border-white/6 bg-surface cursor-pointer transition-all hover:-translate-y-0.5 hover:border-white/14"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
              >
                <div className="aspect-video bg-surface-2 relative overflow-hidden">
                  <img
                    src={ch.poster_url!}
                    alt={ch.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play weight="fill" size={20} className="text-white" />
                  </div>
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-widest">
                    <span className="w-1 h-1 rounded-full bg-white live-dot" /> LIVE
                  </div>
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-[11px] font-semibold text-white truncate tracking-tight">{ch.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
        <footer className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
              <Lightning weight="fill" size={10} className="text-white" />
            </div>
            <span className="text-[13px] font-bold text-white tracking-tight">chillz</span>
            <span className="text-gray-700 text-[13px]">— Watch. Chill. Repeat.</span>
          </div>
          <p className="text-[12px] text-gray-700">Free streaming · No account needed</p>
        </footer>

      </div>
    </div>
  )
}

/* ── Channel Card (horizontal scroll) ── */
function ChannelCard({ channel, onClick }: { channel: TvChannel; onClick: () => void }) {
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-2 mb-2">
        <img
          src={channel.poster_url!}
          alt={channel.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
            <Play weight="fill" size={10} /> Watch
          </div>
        </div>
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-widest">
          <span className="w-1 h-1 rounded-full bg-white live-dot" /> LIVE
        </div>
        {channel.country === 'Uganda' && (
          <div className="absolute top-1.5 right-1.5 text-[9px] bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold px-1.5 py-0.5 rounded-md">
            🇺🇬
          </div>
        )}
      </div>
      <p className="text-[11px] font-semibold text-white truncate tracking-tight">{channel.title}</p>
      <p className="text-[10px] text-gray-700 mt-0.5">{channel.country || 'International'}</p>
    </div>
  )
}

/* ── Match Card ── */
function MatchCard({ fixture: f, onClick, tick }: { fixture: Fixture; onClick: () => void; tick: number }) {
  const isLive = f.status === 'IN_PLAY' || f.status === 'PAUSED'
  const date   = new Date(f.utc_date)
  const today  = new Date()
  const isToday = date.toDateString() === today.toDateString()

  // suppress lint warning for tick — it forces re-render for countdown
  void tick

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 ${
        isLive
          ? 'border-red-500/20 bg-red-500/5 hover:border-red-500/40'
          : 'border-white/6 bg-surface hover:border-white/14'
      }`}
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
    >
      {/* Match background art */}
      <div className="relative h-28 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(108,99,255,0.08))' }}>

        {/* Team crests */}
        <div className="absolute inset-0 flex items-center justify-between px-4 pt-2">
          <img src={f.home_team_crest} alt="" className="w-12 h-12 object-contain drop-shadow-lg"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
          <div className="text-center">
            {isLive ? (
              <span className="text-xl font-black text-red-400 tabular-nums">{f.home_score ?? 0}–{f.away_score ?? 0}</span>
            ) : (
              <span className="text-[11px] font-bold text-gray-400">VS</span>
            )}
          </div>
          <img src={f.away_team_crest} alt="" className="w-12 h-12 object-contain drop-shadow-lg"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
        </div>

        {/* Date chip */}
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-black text-gray-500 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
            {isToday ? 'TODAY' : date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            {' · '}
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Live badge */}
        {isLive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-wider">
            <span className="w-1 h-1 bg-white rounded-full live-dot" /> LIVE
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider truncate">{f.competition_name}</p>
        <p className="text-[12px] font-bold text-white leading-tight truncate">
          {f.home_team_name} vs {f.away_team_name}
        </p>
        {!isLive && (
          <p className="text-[10px] text-gray-600 flex items-center gap-1">
            🕐 {timeUntil(f.utc_date)}
          </p>
        )}
      </div>
    </div>
  )
}

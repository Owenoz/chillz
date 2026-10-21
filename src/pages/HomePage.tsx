import { useNavigate } from 'react-router-dom'
import {
  Television, SoccerBall, FilmSlate, Play,
  ArrowRight, RadioButton, TrendUp,
  Clock, Flame, Lightning, Sparkle,
} from '@phosphor-icons/react'
import channels from '../data/tv_channels.json'
import fixtures from '../data/sports_fixtures.json'
import type { TvChannel, Fixture } from '../data/types'

const tvChannels = (channels as TvChannel[]).filter((c) => c.active)
const allFixtures = fixtures as Fixture[]
const competitions = [...new Set(allFixtures.map((f) => f.competition_name))]

export default function HomePage() {
  const navigate = useNavigate()

  const featuredChannels = tvChannels.slice(0, 10)
  const liveFixtures = allFixtures.filter((f) => f.status === 'IN_PLAY').slice(0, 4)
  const upcomingFixtures = allFixtures
    .filter((f) => f.status === 'SCHEDULED' || f.status === 'TIMED')
    .sort((a, b) => new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime())
    .slice(0, 8)

  return (
    <div className="pb-24 md:pb-10">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Mesh background */}
        <div className="absolute inset-0 bg-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(108,99,255,0.25) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(56,189,248,0.2) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3.5 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
            <span className="text-xs font-medium text-gray-300 tracking-wide">Free · No signup · No ads</span>
          </div>

          {/* Headline */}
          <h1 className="text-[56px] md:text-[80px] font-black tracking-[-0.04em] leading-[0.95] text-white mb-6 max-w-3xl">
            Watch.<br />
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #6c63ff 40%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Chill.</span><br />
            Repeat.
          </h1>

          <p className="text-[17px] text-gray-400 leading-relaxed mb-10 max-w-md font-light">
            Live TV, football scores, free movies —
            all in one place. Just press play.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/tv')}
              className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #6c63ff, #4f46e5)', boxShadow: '0 0 0 1px rgba(108,99,255,0.4), 0 8px 24px rgba(108,99,255,0.25)' }}
            >
              <Television weight="fill" size={16} />
              Watch Live TV
              <ArrowRight size={14} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => navigate('/sports')}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-gray-200 bg-white/6 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
            >
              <SoccerBall weight="duotone" size={16} />
              Live Sports
            </button>

            <button
              onClick={() => navigate('/movies')}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-gray-200 bg-white/6 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
            >
              <FilmSlate weight="duotone" size={16} />
              Movies
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS
      ══════════════════════════════════════ */}
      <div className="border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-border/60">
            {[
              { Icon: RadioButton, value: `${tvChannels.length}+`,  label: 'Live Channels' },
              { Icon: SoccerBall,  value: `${allFixtures.length}+`, label: 'Fixtures'      },
              { Icon: TrendUp,     value: `${competitions.length}`, label: 'Competitions'  },
            ].map(({ Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center py-6 gap-0.5">
                <Icon weight="duotone" size={16} className="text-primary-light mb-2 opacity-60" />
                <span className="text-2xl md:text-3xl font-black tracking-[-0.03em] text-white">{value}</span>
                <span className="text-[11px] text-gray-600 uppercase tracking-widest font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 py-14">

        {/* ══════════════════════════════════════
            LIVE NOW
        ══════════════════════════════════════ */}
        {liveFixtures.length > 0 && (
          <section>
            <Row
              icon={<span className="w-2 h-2 rounded-full bg-red-500 live-dot" />}
              label="Live Now"
              action={{ text: 'All fixtures', onClick: () => navigate('/sports') }}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              {liveFixtures.map((f) => (
                <FixtureCard key={f.id} fixture={f} onClick={() => navigate(`/sports/fixture/${f.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════
            LIVE TV
        ══════════════════════════════════════ */}
        <section>
          <Row
            icon={<Television weight="duotone" size={16} className="text-primary-light" />}
            label="Live TV"
            action={{ text: `All ${tvChannels.length} channels`, onClick: () => navigate('/tv') }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {featuredChannels.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/tv/watch/${ch.id}`)} />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════
            FEATURE TILES
        ══════════════════════════════════════ */}
        <section className="grid md:grid-cols-3 gap-3">
          {[
            {
              icon: <Television weight="duotone" size={22} />,
              title: 'Live TV',
              desc: `${tvChannels.length}+ channels streaming now. Sports, news, entertainment.`,
              color: '#6c63ff',
              path: '/tv',
            },
            {
              icon: <SoccerBall weight="duotone" size={22} />,
              title: 'Live Sports',
              desc: `${allFixtures.length}+ fixtures across ${competitions.length} competitions.`,
              color: '#22c55e',
              path: '/sports',
            },
            {
              icon: <FilmSlate weight="duotone" size={22} />,
              title: 'Free Movies',
              desc: 'Thousands of titles. No login, no sub — just stream.',
              color: '#38bdf8',
              path: '/movies',
            },
          ].map(({ icon, title, desc, color, path }) => (
            <div
              key={title}
              onClick={() => navigate(path)}
              className="group relative overflow-hidden rounded-2xl border border-white/6 bg-surface p-6 cursor-pointer transition-all hover:-translate-y-1 hover:border-white/12"
              style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)` }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(ellipse at top left, ${color}15, transparent 60%)` }}
              />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white"
                style={{ background: `${color}20`, border: `1px solid ${color}30` }}
              >
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
            UPCOMING FIXTURES
        ══════════════════════════════════════ */}
        {upcomingFixtures.length > 0 && (
          <section>
            <Row
              icon={<Clock weight="duotone" size={16} className="text-primary-light" />}
              label="Upcoming Fixtures"
              action={{ text: 'Full schedule', onClick: () => navigate('/sports') }}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              {upcomingFixtures.map((f) => (
                <FixtureCard key={f.id} fixture={f} onClick={() => navigate(`/sports/fixture/${f.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════
            MOVIES BANNER
        ══════════════════════════════════════ */}
        <section
          onClick={() => navigate('/movies')}
          className="group relative overflow-hidden rounded-2xl border border-white/6 bg-surface cursor-pointer transition-all hover:border-white/12 hover:-translate-y-0.5"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.08), transparent 70%)' }} />
          <div className="relative flex items-center justify-between gap-6 p-6 md:p-8">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-sky-400"
                style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
                <FilmSlate weight="duotone" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-[16px] font-bold text-white tracking-tight">Free Movies & TV Shows</h2>
                  <span className="text-[10px] font-black bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 tracking-wider uppercase">Free</span>
                </div>
                <p className="text-[13px] text-gray-600">Stream thousands — zero sign-up, zero subscription.</p>
              </div>
            </div>
            <button className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all"
              style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)' }}>
              <Play weight="fill" size={13} />
              Browse
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════
            COMPETITIONS
        ══════════════════════════════════════ */}
        <section>
          <Row
            icon={<Flame weight="duotone" size={16} className="text-orange-400" />}
            label="Competitions"
            action={{ text: 'All sports', onClick: () => navigate('/sports') }}
          />
          <div className="flex flex-wrap gap-2">
            {competitions.slice(0, 14).map((comp) => {
              const count = allFixtures.filter((f) => f.competition_name === comp).length
              return (
                <button
                  key={comp}
                  onClick={() => navigate('/sports')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-medium text-gray-400 bg-surface border border-white/6 hover:border-white/14 hover:text-white hover:bg-white/5 transition-all"
                >
                  {comp}
                  <span className="text-[10px] font-bold text-gray-700 tabular-nums">{count}</span>
                </button>
              )
            })}
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
          <div className="flex items-center gap-1.5 text-[12px] text-gray-700">
            <Sparkle weight="fill" size={11} className="text-primary/40" />
            Free streaming · No account needed
          </div>
        </footer>

      </div>
    </div>
  )
}

/* ── Sub-components ────────────────────────────────────── */

function Row({ icon, label, action }: {
  icon: React.ReactNode
  label: string
  action?: { text: string; onClick: () => void }
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="flex items-center gap-2 text-[15px] font-bold text-white tracking-tight">
        {icon}
        {label}
      </h2>
      {action && (
        <button onClick={action.onClick}
          className="flex items-center gap-1 text-[12px] font-medium text-gray-600 hover:text-gray-300 transition-colors">
          {action.text}
          <ArrowRight size={12} />
        </button>
      )}
    </div>
  )
}

function ChannelCard({ channel, onClick }: { channel: TvChannel; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/6 bg-surface cursor-pointer transition-all hover:-translate-y-1 hover:border-white/14"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
    >
      <div className="aspect-video bg-surface-2 relative overflow-hidden">
        {channel.poster_url ? (
          <img
            src={channel.poster_url} alt={channel.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-2">
            <Television weight="duotone" size={28} className="text-gray-700" />
          </div>
        )}
        {/* LIVE chip */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-red-500/30 text-red-400 text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-widest">
          <span className="w-1 h-1 rounded-full bg-red-500 live-dot" />
          LIVE
        </div>
        {/* Play pill */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-[2px]">
          <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            <Play weight="fill" size={11} />
            Play
          </div>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[12px] font-semibold text-white truncate tracking-tight">{channel.title}</p>
        {channel.country && (
          <p className="text-[10px] text-gray-700 mt-0.5 tracking-wide">{channel.country}</p>
        )}
      </div>
    </div>
  )
}

function FixtureCard({ fixture, onClick }: { fixture: Fixture; onClick: () => void }) {
  const isLive = fixture.status === 'IN_PLAY'
  const isFinished = fixture.status === 'FINISHED'
  const date = new Date(fixture.utc_date)

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 ${
        isLive
          ? 'bg-red-500/5 border-red-500/15 hover:border-red-500/30'
          : 'bg-surface border-white/6 hover:border-white/14'
      }`}
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-widest truncate max-w-[65%]">
            {fixture.competition_name}
          </span>
          {isLive ? (
            <span className="flex items-center gap-1 text-[10px] font-black text-red-400 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" /> Live
            </span>
          ) : (
            <span className="text-[11px] font-medium text-gray-700 tabular-nums">
              {isFinished ? 'FT' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <img src={fixture.home_team_crest} alt="" className="w-6 h-6 object-contain shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
            <span className={`text-[13px] font-semibold truncate tracking-tight ${
              fixture.winner === 'HOME_TEAM' ? 'text-white' : isFinished ? 'text-gray-600' : 'text-white'
            }`}>{fixture.home_team_name}</span>
          </div>

          <div className="shrink-0 min-w-[52px] text-center">
            {isLive || isFinished ? (
              <span className={`text-[15px] font-black tabular-nums tracking-tight ${isLive ? 'text-red-400' : 'text-white'}`}>
                {fixture.home_score ?? 0}–{fixture.away_score ?? 0}
              </span>
            ) : (
              <span className="text-[12px] font-bold text-gray-600 tabular-nums">
                {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
            <span className={`text-[13px] font-semibold truncate text-right tracking-tight ${
              fixture.winner === 'AWAY_TEAM' ? 'text-white' : isFinished ? 'text-gray-600' : 'text-white'
            }`}>{fixture.away_team_name}</span>
            <img src={fixture.away_team_crest} alt="" className="w-6 h-6 object-contain shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

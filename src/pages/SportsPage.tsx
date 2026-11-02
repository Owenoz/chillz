import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Hls from 'hls.js'
import {
  SoccerBall, MagnifyingGlass, X, ArrowLeft,
  ArrowsOut, ArrowClockwise, SpinnerGap,
  WarningCircle, Television, Broadcast, ArrowRight,
} from '@phosphor-icons/react'
import { fetchLiveFixtures } from '../lib/sportsApi'
import staticData from '../data/sports_fixtures.json'
import type { Fixture } from '../data/types'

// ── Types ─────────────────────────────────────────────────────
interface SportChannel {
  id: number
  name: string
  group: string
  logo: string
  url: string
}

type View = 'channels' | 'fixtures' | 'watch'

const STATUS_TABS = [
  { label: 'All',      value: 'all'      },
  { label: 'Live',     value: 'live'     },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Finished', value: 'finished' },
]

const FIXTURE_STATIC = staticData as Fixture[]

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
  const [view, setView]         = useState<View>('channels')
  const [channels, setChannels] = useState<SportChannel[]>([])
  const [chLoading, setChLoading] = useState(true)
  const [activeChannel, setActiveChannel] = useState<SportChannel | null>(null)
  const [search, setSearch]     = useState('')
  const [group, setGroup]       = useState('All')

  // Fixtures
  const [fixtures, setFixtures]       = useState<Fixture[]>(FIXTURE_STATIC)
  const [fixLoading, setFixLoading]   = useState(false)
  const [liveLoaded, setLiveLoaded]   = useState(false)
  const [statusTab, setStatusTab]     = useState('all')
  const [compFilter, setCompFilter]   = useState('All')
  const [fixSearch, setFixSearch]     = useState('')

  // Load sport channels from public JSON
  useEffect(() => {
    fetch('/sports-streams.json')
      .then(r => r.json())
      .then((d: SportChannel[]) => { setChannels(d); setChLoading(false) })
      .catch(() => setChLoading(false))
  }, [])

  // Load live fixtures
  const loadFixtures = useCallback(async () => {
    setFixLoading(true)
    try {
      const live = await fetchLiveFixtures()
      if (live.length > 0) { setFixtures(live); setLiveLoaded(true) }
    } catch { /* keep static */ }
    finally { setFixLoading(false) }
  }, [])

  useEffect(() => {
    loadFixtures()
    const iv = setInterval(loadFixtures, 60000)
    return () => clearInterval(iv)
  }, [loadFixtures])

  const groups = useMemo(() =>
    ['All', ...Array.from(new Set(channels.map(c => c.group))).sort()],
    [channels]
  )

  const filteredChannels = useMemo(() => {
    const q = search.toLowerCase()
    return channels.filter(c => {
      const matchSearch = !q || c.name.toLowerCase().includes(q)
      const matchGroup  = group === 'All' || c.group === group
      return matchSearch && matchGroup
    })
  }, [channels, search, group])

  const competitions = useMemo(() =>
    ['All', ...Array.from(new Set(fixtures.map(f => f.competition_name))).sort()],
    [fixtures]
  )

  const filteredFixtures = useMemo(() => {
    const q = fixSearch.toLowerCase()
    return sortFixtures(fixtures.filter(f => {
      const matchSearch = !q || f.home_team_name.toLowerCase().includes(q) || f.away_team_name.toLowerCase().includes(q) || f.competition_name.toLowerCase().includes(q)
      const matchComp  = compFilter === 'All' || f.competition_name === compFilter
      const matchStatus = statusTab === 'all' ||
        (statusTab === 'live' && (f.status === 'IN_PLAY' || f.status === 'PAUSED')) ||
        (statusTab === 'upcoming' && (f.status === 'SCHEDULED' || f.status === 'TIMED')) ||
        (statusTab === 'finished' && f.status === 'FINISHED')
      return matchSearch && matchComp && matchStatus
    }))
  }, [fixtures, fixSearch, compFilter, statusTab])

  const liveCount = fixtures.filter(f => f.status === 'IN_PLAY' || f.status === 'PAUSED').length

  // ── Channel player view ────────────────────────────────────
  if (view === 'watch' && activeChannel) {
    return <ChannelPlayer channel={activeChannel} onBack={() => setView('channels')} channels={filteredChannels} onSwitch={ch => setActiveChannel(ch)} />
  }

  return (
    <div className="bg-mesh min-h-screen pb-24">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-10" style={{ background: 'radial-gradient(#10b981,transparent)' }} />
        </div>
        <div className="relative h-40 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&auto=format&fit=crop&q=80"
            alt="" className="w-full h-full object-cover opacity-30"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(10,10,15,0.95) 0%,rgba(10,10,15,0.7) 60%,rgba(10,10,15,0.3) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#0A0A0F 0%,transparent 60%)' }} />
          <div className="absolute inset-0 flex flex-col justify-end px-5 pb-4">
            {liveCount > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-red-400 uppercase mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" /> {liveCount} LIVE
              </span>
            )}
            <h1 className="text-3xl font-black text-white tracking-tight">Live Sports</h1>
          </div>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="px-5 mt-4">
        <div className="flex gap-1 p-1 rounded-2xl w-fit"
          style={{ background: 'rgba(19,17,28,0.9)', border: '1px solid rgba(45,38,69,0.7)' }}>
          {([
            { key: 'channels', label: 'Live Channels', Icon: Television },
            { key: 'fixtures', label: 'Fixtures',      Icon: SoccerBall },
          ] as { key: View; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setView(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: view === key ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                color: view === key ? '#fff' : '#7C7A91',
                boxShadow: view === key ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
              }}>
              <Icon weight="duotone" size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 mt-5 space-y-5">

        {/* ══ CHANNELS VIEW ══ */}
        {view === 'channels' && (
          <>
            {/* Search + group */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass weight="bold" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input type="text" placeholder="Search channels…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-muted focus:outline-none"
                  style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"><X weight="bold" size={13} /></button>}
              </div>
            </div>

            {/* Group pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {groups.map(g => (
                <button key={g} onClick={() => setGroup(g)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: group === g ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'rgba(19,17,28,0.7)',
                    border: `1px solid ${group === g ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.6)'}`,
                    color: group === g ? '#fff' : '#7C7A91',
                    boxShadow: group === g ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                  }}>
                  {g}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted"><span className="text-white font-bold">{filteredChannels.length}</span> channels</p>

            {chLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({length:12}).map((_,i) => (
                  <div key={i} className="rounded-2xl skeleton aspect-video" />
                ))}
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="text-center py-16">
                <Television weight="duotone" size={40} className="text-muted opacity-40 mx-auto mb-3" />
                <p className="text-muted">No channels found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredChannels.map(ch => (
                  <ChannelCard key={ch.id} channel={ch}
                    onClick={() => { setActiveChannel(ch); setView('watch') }} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ FIXTURES VIEW ══ */}
        {view === 'fixtures' && (
          <>
            {/* Search + refresh */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass weight="bold" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input type="text" placeholder="Search teams or competitions…" value={fixSearch}
                  onChange={e => setFixSearch(e.target.value)}
                  className="w-full rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-muted focus:outline-none"
                  style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
                {fixSearch && <button onClick={() => setFixSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"><X weight="bold" size={13} /></button>}
              </div>
              <button onClick={loadFixtures} disabled={fixLoading}
                className="w-10 h-10 rounded-xl border border-border bg-surface-2 flex items-center justify-center text-muted hover:text-white hover:border-primary/40 transition-all disabled:opacity-50">
                {fixLoading ? <SpinnerGap weight="bold" size={15} className="animate-spin" /> : <ArrowClockwise weight="bold" size={15} />}
              </button>
            </div>

            {/* Status tabs */}
            <div className="flex gap-1 p-1 rounded-2xl w-fit"
              style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
              {STATUS_TABS.map(t => (
                <button key={t.value} onClick={() => setStatusTab(t.value)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: statusTab === t.value ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                    color: statusTab === t.value ? '#fff' : '#7C7A91',
                    boxShadow: statusTab === t.value ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                  }}>
                  {t.value === 'live' && liveCount > 0 ? `🔴 Live (${liveCount})` : t.label}
                </button>
              ))}
            </div>

            {/* Competition pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {competitions.slice(0, 16).map(c => (
                <button key={c} onClick={() => setCompFilter(c)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
                  style={{
                    background: compFilter === c ? 'rgba(124,58,237,0.2)' : 'rgba(19,17,28,0.6)',
                    border: `1px solid ${compFilter === c ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.6)'}`,
                    color: compFilter === c ? '#A78BFA' : '#7C7A91',
                  }}>
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted"><span className="text-white font-bold">{filteredFixtures.length}</span> fixtures</p>
              {!liveLoaded && <p className="text-[10px] text-primary-light flex items-center gap-1"><SpinnerGap weight="bold" size={10} className="animate-spin" /> Updating…</p>}
            </div>

            {/* Watch live CTA */}
            <button onClick={() => setView('channels')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(16,185,129,0.1))', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <span className="flex items-center gap-2">
                <Television weight="fill" size={16} className="text-primary-light" />
                Watch Live Sports Channels ({channels.length}+)
              </span>
              <ArrowRight size={14} />
            </button>

            {filteredFixtures.length === 0 ? (
              <div className="text-center py-16">
                <SoccerBall weight="duotone" size={40} className="text-muted opacity-40 mx-auto mb-3" />
                <p className="text-muted">No fixtures match your filters</p>
              </div>
            ) : (
              <FixtureList fixtures={filteredFixtures} onSelect={f => navigate(`/sports/fixture/${f.id}`)} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ── Channel Card ── */
function ChannelCard({ channel: ch, onClick }: { channel: SportChannel; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface hover:border-primary/40 transition-all hover:-translate-y-0.5 channel-glow text-left w-full">
      <div className="aspect-video relative overflow-hidden bg-surface-2 flex items-center justify-center">
        {ch.logo ? (
          <img src={ch.logo} alt={ch.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(10,10,15,0.9))' }}>
            <Broadcast weight="duotone" size={28} className="text-primary-light opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-glow-sm"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
            <Television weight="fill" size={16} className="text-white" />
          </div>
        </div>
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
          <span className="w-1 h-1 bg-white rounded-full live-dot" /> LIVE
        </div>
        <div className="absolute top-1.5 right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-md text-white"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          HLS
        </div>
      </div>
      <div className="p-2">
        <p className="text-[11px] font-bold text-white truncate">{ch.name}</p>
        <p className="text-[9px] text-muted mt-0.5">{ch.group}</p>
      </div>
    </button>
  )
}

/* ── HLS Player ── */
function ChannelPlayer({ channel, onBack, channels, onSwitch }: {
  channel: SportChannel
  onBack: () => void
  channels: SportChannel[]
  onSwitch: (ch: SportChannel) => void
}) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const hlsRef      = useRef<Hls | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState]     = useState<'loading' | 'playing' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [isFs, setIsFs]         = useState(false)
  const [search, setSearch]     = useState('')

  const sidebarChannels = channels.filter(c =>
    c.id !== channel.id &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 40)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    setState('loading')
    setErrorMsg('')

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }

    const onErr = (msg = 'Stream unavailable. Try another channel.') => {
      setState('error'); setErrorMsg(msg)
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true, enableWorker: true, maxBufferLength: 30 })
      hls.loadSource(channel.url)
      hls.attachMedia(v)
      hls.on(Hls.Events.MANIFEST_PARSED, () => { v.play().catch(() => {}); setState('playing') })
      hls.on(Hls.Events.ERROR, (_e, d) => {
        if (!d.fatal) return
        if (d.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad()
        else if (d.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError()
        else onErr()
      })
      hlsRef.current = hls
    } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = channel.url
      v.addEventListener('loadeddata', () => setState('playing'), { once: true })
      v.addEventListener('error', () => onErr(), { once: true })
      v.play().catch(() => {})
    } else {
      onErr('Your browser cannot play HLS streams.')
    }

    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null } }
  }, [channel.url, retryKey])

  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  const toggleFs = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await containerRef.current?.requestFullscreen()
    } catch { /* ignore */ }
  }

  return (
    <div className="bg-mesh min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* Back */}
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-white mb-4 transition-colors group">
          <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to channels
        </button>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* Player */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-black text-white flex-1">{channel.name}</h1>
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/25 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot" /> LIVE
              </span>
              <span className="text-xs text-muted bg-surface border border-border px-2 py-1 rounded-full">{channel.group}</span>
            </div>

            <div ref={containerRef}
              className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.7)' }}>

              {state === 'loading' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-4 pointer-events-none">
                  <div className="relative">
                    <SpinnerGap weight="bold" size={40} className="text-primary animate-spin" />
                    <div className="absolute inset-0 rounded-full blur-xl opacity-25" style={{ background: '#7C3AED' }} />
                  </div>
                  <p className="text-xs text-muted">Connecting to stream…</p>
                </div>
              )}

              {state === 'error' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/95 gap-4 p-6 text-center">
                  <WarningCircle weight="duotone" size={36} className="text-amber-500" />
                  <p className="text-white font-bold">Stream unavailable</p>
                  <p className="text-muted text-sm max-w-xs">{errorMsg}</p>
                  <button onClick={() => setRetryKey(k => k + 1)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
                    ↺ Retry
                  </button>
                  <button onClick={onBack} className="text-xs text-muted hover:text-white transition-colors">Browse other channels</button>
                </div>
              )}

              <video ref={videoRef} className="absolute inset-0 w-full h-full"
                controls autoPlay muted playsInline
                poster={channel.logo || undefined}
                onError={() => { setState('error'); setErrorMsg('Stream failed to load.') }}
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setRetryKey(k => k + 1)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all"
                style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
                <ArrowClockwise weight="bold" size={13} /> Reload
              </button>
              <button onClick={toggleFs}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all"
                style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
                <ArrowsOut weight="bold" size={13} /> {isFs ? 'Exit' : 'Fullscreen'}
              </button>
            </div>
          </div>

          {/* Sidebar channels */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Broadcast weight="duotone" size={15} className="text-primary-light" /> More Channels
              <span className="text-xs text-muted ml-auto">{channels.length} total</span>
            </h3>
            <div className="relative">
              <MagnifyingGlass weight="bold" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input type="text" placeholder="Filter…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-muted focus:outline-none"
                style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }} />
            </div>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-0.5 no-scrollbar">
              {sidebarChannels.map(ch => (
                <button key={ch.id} onClick={() => onSwitch(ch)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group ${ch.id === channel.id ? 'bg-primary/15 border border-primary/30' : 'bg-surface border border-border hover:border-primary/30 hover:bg-surface-2'}`}>
                  <div className="w-14 h-9 rounded-lg overflow-hidden bg-surface-2 shrink-0 flex items-center justify-center">
                    {ch.logo
                      ? <img src={ch.logo} alt="" className="w-full h-full object-cover" onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')} />
                      : <Broadcast weight="duotone" size={16} className="text-primary-light opacity-50" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-white truncate group-hover:text-primary-light transition-colors">{ch.name}</p>
                    <p className="text-[9px] text-muted mt-0.5">{ch.group}</p>
                  </div>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Fixture list ── */
function FixtureList({ fixtures, onSelect }: { fixtures: Fixture[]; onSelect: (f: Fixture) => void }) {
  const groups: Record<string, Fixture[]> = {}
  for (const f of fixtures) {
    if (!groups[f.competition_name]) groups[f.competition_name] = []
    groups[f.competition_name].push(f)
  }
  return (
    <div className="space-y-5">
      {Object.entries(groups).map(([comp, matches]) => (
        <div key={comp}>
          <div className="flex items-center gap-3 mb-2">
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
  const isLive = f.status === 'IN_PLAY' || f.status === 'PAUSED'
  const isFin  = f.status === 'FINISHED'
  const date   = new Date(f.utc_date)
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border transition-all hover:-translate-y-0.5 group"
      style={{
        background: isLive ? 'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(19,17,28,0.95))' : 'rgba(19,17,28,0.7)',
        border: `1px solid ${isLive ? 'rgba(239,68,68,0.25)' : 'rgba(45,38,69,0.8)'}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img src={f.home_team_crest} alt="" className="w-6 h-6 object-contain shrink-0"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')} />
          <span className={`text-sm font-bold truncate ${f.winner==='HOME_TEAM' ? 'text-white' : isFin ? 'text-muted' : 'text-white'}`}>{f.home_team_name}</span>
        </div>
        <div className="shrink-0 text-center min-w-[76px]">
          {isLive ? (
            <div className="flex flex-col items-center"><span className="text-lg font-black text-red-400 tabular-nums">{f.home_score??0}–{f.away_score??0}</span><span className="flex items-center gap-1 text-[9px] text-red-400 font-black"><span className="w-1 h-1 bg-red-500 rounded-full live-dot" /> LIVE</span></div>
          ) : isFin ? (
            <div className="flex flex-col items-center"><span className="text-lg font-black text-white tabular-nums">{f.home_score??0}–{f.away_score??0}</span><span className="text-[9px] text-muted font-bold">FT</span></div>
          ) : (
            <div className="flex flex-col items-center"><span className="text-sm font-bold text-white tabular-nums">{date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span><span className="text-[9px] text-muted">{date.toLocaleDateString([],{month:'short',day:'numeric'})}</span></div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className={`text-sm font-bold truncate text-right ${f.winner==='AWAY_TEAM' ? 'text-white' : isFin ? 'text-muted' : 'text-white'}`}>{f.away_team_name}</span>
          <img src={f.away_team_crest} alt="" className="w-6 h-6 object-contain shrink-0"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')} />
        </div>
      </div>
    </button>
  )
}

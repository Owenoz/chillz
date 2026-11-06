import { useState } from 'react'
import {
  Radio, ArrowLeft, ArrowClockwise, ArrowsOut,
  MusicNote, Broadcast,
} from '@phosphor-icons/react'
import { RADIO_STATIONS, type RadioStation } from '../data/uganda_extras'

// Build YouTube live embed URL from channel ID
function ytEmbed(channelId: string): string {
  return `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=1&rel=0&modestbranding=1&enablejsapi=0`
}

export default function RadioPage() {
  const [active, setActive]     = useState<RadioStation | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [loaded, setLoaded]     = useState(false)

  // ── Watch page ──────────────────────────────────────────────
  if (active) {
    return (
      <div className="bg-mesh min-h-screen pb-24">
        <div className="max-w-4xl mx-auto px-4 py-4">

          {/* Back */}
          <button onClick={() => { setActive(null); setLoaded(false) }}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-white mb-5 transition-colors group">
            <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform"/>
            Back to Radio
          </button>

          {/* Station header */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-2 border border-border shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(19,17,28,0.9))' }}>
              {active.logo
                ? <img src={active.logo} alt={active.name}
                    className="w-full h-full object-cover"
                    onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                : <Radio weight="duotone" size={28} className="text-primary-light opacity-70"/>}
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">{active.name}</h1>
              <p className="text-sm text-muted">{active.frequency} · {active.genre}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs font-black text-red-400 bg-red-500/15 border border-red-500/25 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot"/> LIVE
            </div>
          </div>

          {/* YouTube Live player */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border mb-4"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.7)' }}>
            {!loaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-4 pointer-events-none">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                    <Radio weight="fill" size={36} className="text-white"/>
                  </div>
                </div>
                <p className="text-sm text-muted font-medium">Loading {active.name}…</p>
              </div>
            )}
            <iframe
              key={`radio-${active.id}-${reloadKey}`}
              src={ytEmbed(active.yt_channel_id)}
              title={active.name}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              onLoad={() => setLoaded(true)}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => { setLoaded(false); setReloadKey(k => k + 1) }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all"
              style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
              <ArrowClockwise weight="bold" size={13}/> Reload
            </button>
            <a href={`https://www.youtube.com/channel/${active.yt_channel_id}/live`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all"
              style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
              <ArrowsOut weight="bold" size={13}/> Open Full Screen
            </a>
          </div>

          {/* Description */}
          <p className="text-sm text-muted leading-relaxed">{active.description}</p>

          {/* Other stations */}
          <div className="mt-8">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Radio weight="duotone" size={14} className="text-primary-light"/> Other Stations
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {RADIO_STATIONS.filter(s => s.id !== active.id).map(station => (
                <button key={station.id}
                  onClick={() => { setActive(station); setLoaded(false); setReloadKey(0) }}
                  className="shrink-0 flex flex-col items-center gap-1.5 group">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-border group-hover:border-primary/50 transition-all"
                    style={{ background: 'rgba(19,17,28,0.8)' }}>
                    {station.logo
                      ? <img src={station.logo} alt={station.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Radio weight="duotone" size={22} className="text-primary-light opacity-50"/>
                        </div>}
                  </div>
                  <span className="text-[9px] font-semibold text-muted group-hover:text-white transition-colors text-center w-16 truncate">
                    {station.name.replace(' FM','').replace(' Radio','')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Browse page ─────────────────────────────────────────────
  return (
    <div className="bg-mesh min-h-screen pb-24">

      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border/40"
        style={{ background: 'linear-gradient(180deg,rgba(124,58,237,0.15) 0%,transparent 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-15"
            style={{ background: 'radial-gradient(ellipse,#7C3AED,transparent)' }}/>
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-[60px] opacity-10"
            style={{ background: 'radial-gradient(ellipse,#EC4899,transparent)' }}/>
        </div>
        <div className="max-w-7xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-glow-md"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
              <Radio weight="fill" size={30} className="text-white"/>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Uganda Radio</h1>
              <p className="text-muted text-sm mt-0.5">{RADIO_STATIONS.length} stations · Free · Works on slow internet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Station grid */}
      <div className="max-w-7xl mx-auto px-5 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {RADIO_STATIONS.map(station => (
            <button key={station.id} onClick={() => { setActive(station); setLoaded(false) }}
              className="group relative overflow-hidden rounded-2xl p-5 text-center transition-all hover:-translate-y-1"
              style={{
                background: 'rgba(19,17,28,0.8)',
                border: '1px solid rgba(45,38,69,0.6)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}>

              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                style={{ background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.12), transparent 70%)' }}/>

              {/* Logo */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 flex items-center justify-center border border-border"
                style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(19,17,28,0.9))' }}>
                {station.logo
                  ? <img src={station.logo} alt={station.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
                      onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                  : <Radio weight="duotone" size={28} className="text-primary-light opacity-60"/>}
              </div>

              <p className="text-sm font-black text-white tracking-tight">{station.name}</p>
              <p className="text-[10px] text-muted mt-0.5">{station.frequency}</p>
              <p className="text-[10px] text-muted mt-0.5 line-clamp-1">{station.genre}</p>

              {/* Listen button */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-primary-light group-hover:text-white transition-colors">
                <MusicNote weight="fill" size={12}/> Listen Live
              </div>

              {/* Live badge */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-red-600/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
                <span className="w-1 h-1 bg-white rounded-full live-dot"/> LIVE
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted mt-8 pb-4">
          <Broadcast weight="duotone" size={13} className="inline mr-1 text-primary-light opacity-60"/>
          Streams powered by YouTube Live · Tap any station to listen
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Church as ChurchIcon, Play, ArrowsOut, ArrowLeft, ArrowClockwise } from '@phosphor-icons/react'
import { CHURCHES, type Church } from '../data/uganda_extras'

function ytLiveEmbed(channelId: string) {
  return `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=1&rel=0&modestbranding=1`
}

export default function ChurchPage() {
  const [active, setActive]   = useState<Church | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [loaded, setLoaded]   = useState(false)

  if (active) {
    return (
      <div className="bg-mesh min-h-screen pb-24">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => { setActive(null); setLoaded(false) }}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-white mb-4 transition-colors group">
            <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform"/>
            Back to Churches
          </button>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-xl font-black text-white flex-1">{active.name}</h1>
            <span className="text-xs text-muted bg-surface border border-border px-2.5 py-1 rounded-full">{active.denomination}</span>
            <span className="text-xs text-muted bg-surface border border-border px-2.5 py-1 rounded-full">📍 {active.location}</span>
          </div>

          {/* Live player */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border mb-3"
            style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.7)' }}>
            {!loaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-3 pointer-events-none">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                  <ChurchIcon weight="fill" size={28} className="text-white"/>
                </div>
                <p className="text-sm text-muted">Loading live stream…</p>
              </div>
            )}
            <iframe key={`church-${active.id}-${reloadKey}`}
              src={ytLiveEmbed(active.youtube_channel_id)}
              title={active.name}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              onLoad={() => setLoaded(true)}/>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setLoaded(false); setReloadKey(k => k+1) }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all"
              style={{ background:'rgba(19,17,28,0.8)', border:'1px solid rgba(45,38,69,0.6)' }}>
              <ArrowClockwise weight="bold" size={13}/> Reload
            </button>
            <a href={`https://youtube.com/${active.youtube_handle}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all"
              style={{ background:'rgba(19,17,28,0.8)', border:'1px solid rgba(45,38,69,0.6)' }}>
              <ArrowsOut weight="bold" size={13}/> Open on YouTube
            </a>
          </div>

          <p className="text-sm text-muted mt-4">{active.description}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-mesh min-h-screen pb-24">
      <div className="relative overflow-hidden border-b border-border/40"
        style={{ background: 'linear-gradient(180deg,rgba(124,58,237,0.12) 0%,transparent 100%)' }}>
        <div className="max-w-7xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center gap-4 mb-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-sm"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
              <ChurchIcon weight="fill" size={26} className="text-white"/>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Church & Gospel</h1>
              <p className="text-muted text-sm">{CHURCHES.length} churches · Live every Sunday</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CHURCHES.map(church => (
            <button key={church.id} onClick={() => { setActive(church); setLoaded(false) }}
              className="group relative overflow-hidden rounded-2xl text-left transition-all hover:-translate-y-1"
              style={{ background:'rgba(19,17,28,0.8)', border:'1px solid rgba(45,38,69,0.6)', boxShadow:'0 4px 16px rgba(0,0,0,0.4)' }}>

              {/* YouTube thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-surface-2">
                <img
                  src={`https://img.youtube.com/vi/`+
                    /* use a fallback to get the channel's latest thumbnail */
                    `${church.youtube_channel_id.slice(0,11)}/mqdefault.jpg`}
                  alt={church.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => {
                    const el = e.currentTarget as HTMLImageElement
                    el.src = 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=400&auto=format&fit=crop&q=60'
                  }}/>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-glow-sm"
                    style={{ background:'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
                    <Play weight="fill" size={18} className="text-white translate-x-0.5"/>
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
                  <span className="w-1 h-1 bg-white rounded-full live-dot"/> LIVE
                </div>
              </div>

              <div className="p-3">
                <p className="text-sm font-black text-white truncate">{church.name}</p>
                <p className="text-[10px] text-muted mt-0.5">{church.denomination} · {church.location}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-8 py-4">
          Live streams powered by YouTube · Services every Sunday & weekdays
        </p>
      </div>
    </div>
  )
}

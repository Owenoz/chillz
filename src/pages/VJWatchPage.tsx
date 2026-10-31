import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft, SpinnerGap, ArrowsOut, ArrowClockwise,
  ArrowSquareOut, Translate, Play,
} from '@phosphor-icons/react'
import { saveContinueWatching } from '../lib/watchlist'

export default function VJWatchPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const rawId    = id ? decodeURIComponent(id) : ''
  const title    = searchParams.get('title')  || 'Now Playing'
  const poster   = searchParams.get('poster') || ''
  const type     = searchParams.get('type')   || 'movie'

  const embedUrl = `https://s-u.in/detail/${type}/${encodeURIComponent(rawId)}`

  const [reloadKey, setReloadKey] = useState(0)
  const [loaded, setLoaded]       = useState(false)
  const [timedOut, setTimedOut]   = useState(false)
  const [isFs, setIsFs]           = useState(false)

  // Save to continue watching
  useEffect(() => {
    if (!rawId || !title) return
    saveContinueWatching({
      item_id:    rawId,
      item_type:  'movie',
      item_title: title,
      item_poster: poster,
      item_url:   `/movies/vj/${encodeURIComponent(rawId)}?title=${encodeURIComponent(title)}&poster=${encodeURIComponent(poster)}&type=${type}`,
    })
  }, [rawId])

  // Spinner + 12s timeout fallback
  useEffect(() => {
    setLoaded(false)
    setTimedOut(false)
    const t = setTimeout(() => { setTimedOut(true); setLoaded(true) }, 12000)
    return () => clearTimeout(t)
  }, [reloadKey, rawId])

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

  if (!rawId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Translate weight="duotone" size={48} className="text-muted opacity-40" />
        <p className="text-white font-semibold">Invalid link</p>
        <button onClick={() => navigate('/movies')} className="text-primary-light text-sm hover:underline flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    )
  }

  return (
    <div className="bg-mesh min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 py-4">

        {/* Back */}
        <button onClick={() => navigate('/movies')}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-white mb-5 transition-colors group">
          <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Movies
        </button>

        {/* Title */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight flex-1">{title}</h1>
          <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#A78BFA' }}>
            <Translate weight="duotone" size={11} /> Luganda VJ
          </span>
          <span className="text-xs bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-semibold capitalize">{type}</span>
        </div>

        {/* Player */}
        <div ref={containerRef}
          className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border mb-3"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.6)' }}>

          {/* Loading spinner */}
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-4 pointer-events-none">
              <div className="relative">
                <SpinnerGap weight="bold" size={36} className="text-primary animate-spin" />
                <div className="absolute inset-0 rounded-full blur-lg bg-primary/20" />
              </div>
              <p className="text-xs text-muted font-medium">Loading player…</p>
            </div>
          )}

          {/* Timeout fallback */}
          {timedOut && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-6 text-center gap-5 z-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                <Play weight="fill" size={28} className="text-white" />
              </div>
              <div>
                <p className="text-white font-black text-base mb-1">{title}</p>
                <p className="text-sm text-muted max-w-xs">Open on the source site to watch this VJ translated movie.</p>
              </div>
              <a href={embedUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 8px 24px rgba(124,58,237,0.5)' }}>
                <Play weight="fill" size={14} /> Watch Now
                <ArrowSquareOut weight="bold" size={13} />
              </a>
              <button onClick={() => { setTimedOut(false); setLoaded(false); setReloadKey(k => k + 1) }}
                className="text-xs text-muted hover:text-white transition-colors">
                ↺ Try again
              </button>
            </div>
          )}

          {/* Iframe */}
          <iframe
            key={`vj-${rawId}-${reloadKey}`}
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => { setLoaded(true); setTimedOut(false) }}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setLoaded(false); setTimedOut(false); setReloadKey(k => k + 1) }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all"
            style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
            <ArrowClockwise weight="bold" size={13} /> Reload
          </button>
          <button onClick={toggleFs}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all"
            style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
            <ArrowsOut weight="bold" size={13} /> {isFs ? 'Exit' : 'Fullscreen'}
          </button>
          <a href={embedUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all"
            style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
            <ArrowSquareOut weight="bold" size={13} /> Open Full Page
          </a>
        </div>
      </div>
    </div>
  )
}

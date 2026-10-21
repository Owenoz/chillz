import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  FilmSlate, ArrowLeft, SpinnerGap, Star,
  ArrowSquareOut, ArrowsOut, ArrowClockwise,
  Television,
} from '@phosphor-icons/react'

export default function MovieWatchPage() {
  const { tmdbId } = useParams<{ tmdbId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const type   = searchParams.get('type')   || 'movie'
  const title  = searchParams.get('title')  || 'Now Playing'
  const year   = searchParams.get('year')   || ''
  const rating = searchParams.get('rating') || ''
  const poster = searchParams.get('poster') || ''
  const plot   = searchParams.get('plot')   || ''

  const isTv = type === 'tv'
  const [season, setSeason]       = useState(1)
  const [episode, setEpisode]     = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [loaded, setLoaded]       = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Clear spinner after 8s fallback
  useEffect(() => {
    setLoaded(false)
    const timer = setTimeout(() => setLoaded(true), 8000)
    return () => clearTimeout(timer)
  }, [reloadKey, season, episode])

  // Track fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await containerRef.current?.requestFullscreen()
      }
    } catch { /* ignore */ }
  }

  if (!tmdbId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 gap-4">
        <FilmSlate weight="duotone" size={48} className="text-gray-700" />
        <p className="font-semibold text-white">Invalid movie link</p>
        <button onClick={() => navigate('/movies')} className="flex items-center gap-1.5 text-primary-light hover:underline text-sm">
          <ArrowLeft weight="bold" size={14} /> Back to movies
        </button>
      </div>
    )
  }

  const embedUrl = isTv
    ? `https://atlantic.st/embed/tv/${tmdbId}/${season}/${episode}`
    : `https://atlantic.st/embed/movie/${tmdbId}`

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 pb-24 md:pb-8">

      {/* Back */}
      <button
        onClick={() => navigate('/movies')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-5 transition-colors group"
      >
        <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to movies
      </button>

      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* ── Player column (2/3) ── */}
        <div className="lg:col-span-2 space-y-3">

          {/* Title row */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight flex-1">{title}</h1>
            <span className="text-xs bg-primary/15 border border-primary/25 text-primary-light px-2.5 py-1 rounded-full font-semibold">
              {isTv ? 'TV Series' : 'Movie'} · Free
            </span>
          </div>

          {/* Player */}
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.6)' }}
          >
            {/* Spinner */}
            {!loaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-4 pointer-events-none">
                <div className="relative">
                  <SpinnerGap weight="bold" size={36} className="text-primary animate-spin" />
                  <div className="absolute inset-0 rounded-full blur-lg bg-primary/20" />
                </div>
                <p className="text-xs text-gray-600 font-medium">Loading player…</p>
              </div>
            )}

            <iframe
              key={`${reloadKey}-s${season}-e${episode}`}
              src={embedUrl}
              title={title}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; clipboard-write"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setLoaded(true)}
            />
          </div>

          {/* Controls bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setLoaded(false); setReloadKey((k) => k + 1) }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border hover:border-primary/40 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
            >
              <ArrowClockwise weight="bold" size={13} /> Reload
            </button>
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border hover:border-primary/40 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
            >
              <ArrowSquareOut weight="bold" size={13} /> New Tab
            </a>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border hover:border-primary/40 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
            >
              <ArrowsOut weight="bold" size={13} />
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>

          {/* TV Controls */}
          {isTv && (
            <div className="p-4 bg-surface border border-border rounded-2xl">
              <div className="flex items-center gap-1.5 mb-4">
                <Television weight="duotone" size={15} className="text-primary-light" />
                <span className="text-sm font-bold text-white tracking-tight">Episode Selector</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2.5 text-sm text-gray-400">
                  <span className="text-gray-600 text-xs uppercase tracking-wider font-semibold">Season</span>
                  <input
                    type="number"
                    min={1}
                    value={season}
                    onChange={(e) => { setSeason(Math.max(1, Number(e.target.value) || 1)); setLoaded(false) }}
                    className="w-16 bg-surface-2 border border-border rounded-xl px-2 py-2 text-white text-center text-sm font-semibold focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </label>
                <label className="flex items-center gap-2.5 text-sm text-gray-400">
                  <span className="text-gray-600 text-xs uppercase tracking-wider font-semibold">Episode</span>
                  <input
                    type="number"
                    min={1}
                    value={episode}
                    onChange={(e) => { setEpisode(Math.max(1, Number(e.target.value) || 1)); setLoaded(false) }}
                    className="w-16 bg-surface-2 border border-border rounded-xl px-2 py-2 text-white text-center text-sm font-semibold focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </label>
                <button
                  onClick={() => { setEpisode((e) => e + 1); setLoaded(false) }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Next Episode →
                </button>
              </div>
            </div>
          )}

          {/* Hint */}
          <p className="text-[11px] text-gray-700 bg-surface border border-border/50 rounded-xl px-4 py-2.5 leading-relaxed">
            💡 If the player doesn't start — wait a few seconds, hit Reload, or open in a new tab. Streams come from an external provider.
          </p>
        </div>

        {/* ── Info sidebar (1/3) ── */}
        <div className="space-y-4">
          {/* Poster card */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            {poster ? (
              <img
                src={poster}
                alt={title}
                className="w-full aspect-[2/3] object-cover"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-surface-2 flex items-center justify-center">
                <FilmSlate weight="duotone" size={48} className="text-gray-700" />
              </div>
            )}
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2 text-xs">
                {year && (
                  <span className="bg-surface-2 border border-border text-gray-400 px-2.5 py-1 rounded-full font-medium">{year}</span>
                )}
                {rating && (
                  <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-semibold">
                    <Star weight="fill" size={10} /> {rating}
                  </span>
                )}
                <span className="bg-primary/10 border border-primary/20 text-primary-light px-2.5 py-1 rounded-full font-semibold">
                  {isTv ? 'Series' : 'Movie'}
                </span>
              </div>
              {plot && (
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-5">{plot}</p>
              )}
              {!plot && (
                <p className="text-sm text-gray-600">
                  Watch {isTv ? 'every episode' : 'the full film'} free — no account needed.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

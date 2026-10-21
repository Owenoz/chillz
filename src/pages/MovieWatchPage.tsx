import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { FilmSlate, ArrowLeft, SpinnerGap, Star } from '@phosphor-icons/react'

export default function MovieWatchPage() {
  const { tmdbId } = useParams<{ tmdbId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const type = searchParams.get('type') || 'movie'
  const title = searchParams.get('title') || 'Now Playing'
  const year = searchParams.get('year') || ''
  const rating = searchParams.get('rating') || ''
  const poster = searchParams.get('poster') || ''
  const plot = searchParams.get('plot') || ''

  const isTv = type === 'tv'
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [loaded, setLoaded] = useState(false)

  // Clear loading spinner after 6s fallback — in case onLoad is delayed
  useEffect(() => {
    setLoaded(false)
    const timer = setTimeout(() => setLoaded(true), 6000)
    return () => clearTimeout(timer)
  }, [reloadKey, season, episode])

  if (!tmdbId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 gap-3">
        <FilmSlate weight="duotone" size={48} className="text-gray-700" />
        <p>Invalid movie link</p>
        <button onClick={() => navigate('/movies')} className="text-primary-light hover:underline text-sm"><ArrowLeft weight="bold" size={14} /> Back</button>
      </div>
    )
  }

  const embedUrl = isTv
    ? `https://atlantic.st/embed/tv/${tmdbId}/${season}/${episode}`
    : `https://atlantic.st/embed/movie/${tmdbId}`

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await containerRef.current?.requestFullscreen()
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 pb-24 md:pb-8">
      {/* Back */}
      <button
        onClick={() => navigate('/movies')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft weight="bold" size={14} /> Back to movies
      </button>

      <div className="space-y-4">
        {/* Title */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl md:text-2xl font-black text-white leading-tight">{title}</h1>
          <span className="text-xs bg-surface border border-border px-2 py-0.5 rounded-full text-gray-400">
            {isTv ? 'TV Series' : 'Movie'} · Free
          </span>
        </div>

        {/* Player */}
        <div
          ref={containerRef}
          className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border"
        >
          {/* Loading spinner */}
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-3 pointer-events-none">
              <SpinnerGap weight="bold" size={32} className="text-primary animate-spin" />
              <p className="text-xs text-gray-500">Loading player…</p>
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

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-surface border border-border hover:border-primary/50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            ⛶ Fullscreen
          </button>
          <button
            onClick={() => { setLoaded(false); setReloadKey((k) => k + 1) }}
            className="px-4 py-2 bg-surface border border-border hover:border-primary/50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            ↺ Reload Player
          </button>
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-surface border border-border hover:border-primary/50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            ↗ Open in New Tab
          </a>
        </div>

        {/* TV season/episode controls */}
        {isTv && (
          <div className="flex flex-wrap items-center gap-4 p-4 bg-surface border border-border rounded-xl text-sm">
            <label className="flex items-center gap-2 text-gray-400">
              Season
              <input
                type="number"
                min={1}
                value={season}
                onChange={(e) => { setSeason(Math.max(1, Number(e.target.value) || 1)); setLoaded(false) }}
                className="w-16 bg-surface-2 border border-border rounded-lg px-2 py-1.5 text-white text-center focus:outline-none focus:border-primary/60"
              />
            </label>
            <label className="flex items-center gap-2 text-gray-400">
              Episode
              <input
                type="number"
                min={1}
                value={episode}
                onChange={(e) => { setEpisode(Math.max(1, Number(e.target.value) || 1)); setLoaded(false) }}
                className="w-16 bg-surface-2 border border-border rounded-lg px-2 py-1.5 text-white text-center focus:outline-none focus:border-primary/60"
              />
            </label>
            <button
              onClick={() => { setEpisode((e) => e + 1); setLoaded(false) }}
              className="px-4 py-2 bg-primary hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Next Episode →
            </button>
          </div>
        )}

        {/* Movie info */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-surface border border-border rounded-xl">
          {poster && (
            <img
              src={poster}
              alt={title}
              className="w-24 h-36 object-cover rounded-xl shrink-0 self-start bg-surface-2"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            />
          )}
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {year && <span className="border border-border px-2 py-0.5 rounded-full">{year}</span>}
              {rating && (
                <span className="flex items-center gap-1 border border-border px-2 py-0.5 rounded-full">
                  <Star weight="fill" size={11} className="text-amber-400 inline-block" /> {rating}/10
                </span>
              )}
              <span className="border border-border px-2 py-0.5 rounded-full">{isTv ? 'TV Series' : 'Movie'}</span>
            </div>
            {plot ? (
              <p className="text-sm text-gray-300 leading-relaxed">{plot}</p>
            ) : (
              <p className="text-sm text-gray-500">
                Watch {isTv ? 'every episode of this series' : 'this full movie'} free — no account needed.
              </p>
            )}
            <p className="text-xs text-gray-600 bg-surface-2 border border-border rounded-lg px-3 py-2">
              💡 If the player doesn't start: wait a few seconds, hit Reload, or tap "Open in New Tab". Streams come from an external provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

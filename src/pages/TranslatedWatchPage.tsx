import { useParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft, ArrowSquareOut, ArrowsOut, ArrowClockwise,
  Translate, Microphone, SpinnerGap, WarningCircle,
} from '@phosphor-icons/react'
import moviesData from '../data/translated_movies.json'

interface TranslatedMovie {
  id: string
  title: string
  vj: string
  genre: string[]
  year: number
  language: string
  description: string
  poster_url: string
  source_url: string
  source_site: string
  embed_url: string
  category: string
}

const movies = moviesData as TranslatedMovie[]

const VJ_COLORS: Record<string, string> = {
  'VJ Junior': '#8B5CF6',
  'VJ Ice P':  '#3B82F6',
  'VJ Emmy':   '#10B981',
  'VJ Muba':   '#F59E0B',
  'VJ Jingo':  '#EF4444',
  'VJ Kevo':   '#EC4899',
  'VJ Mark':   '#6366F1',
}

export default function TranslatedWatchPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  const movie = movies.find(m => m.id === id)

  // After 10s, if iframe hasn't loaded show a fallback
  useEffect(() => {
    setLoaded(false)
    setTimedOut(false)
    const timer = setTimeout(() => {
      setTimedOut(true)
      setLoaded(true)
    }, 10000)
    return () => clearTimeout(timer)
  }, [id, reloadKey])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await containerRef.current?.requestFullscreen()
    } catch { /* ignore */ }
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Translate weight="duotone" size={48} className="text-gray-700" />
        <p className="text-white font-semibold">Movie not found</p>
        <button onClick={() => navigate('/translated')} className="flex items-center gap-1.5 text-primary-light hover:underline text-sm">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    )
  }

  const vjColor = VJ_COLORS[movie.vj] || '#8B5CF6'

  // More movies by same VJ
  const moreByVj = movies.filter(m => m.vj === movie.vj && m.id !== movie.id).slice(0, 6)

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-8">

      {/* Back */}
      <button
        onClick={() => navigate('/translated')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-5 transition-colors group"
      >
        <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Translated Movies
      </button>

      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* ── Player column ── */}
        <div className="lg:col-span-2 space-y-3">

          {/* Title */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight flex-1">
              {movie.title}
            </h1>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: `${vjColor}20`, border: `1px solid ${vjColor}40`, color: vjColor }}
            >
              {movie.vj}
            </span>
          </div>

          {/* Player */}
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.6)' }}
          >
            {/* Loading spinner */}
            {!loaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-4 pointer-events-none">
                <div className="relative">
                  <SpinnerGap weight="bold" size={36} className="animate-spin" style={{ color: vjColor }} />
                  <div className="absolute inset-0 rounded-full blur-lg opacity-20" style={{ background: vjColor }} />
                </div>
                <p className="text-xs text-gray-600">Loading player…</p>
              </div>
            )}

            {/* Timeout — show "open on source site" fallback */}
            {timedOut ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-6 text-center gap-4 z-20">
                <WarningCircle weight="duotone" size={36} className="text-amber-500" />
                <div>
                  <p className="text-white font-semibold mb-1">Player requires direct access</p>
                  <p className="text-sm text-gray-500 max-w-xs">
                    This content is hosted on {movie.source_site}. Open it directly to watch.
                  </p>
                </div>
                <a
                  href={movie.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${vjColor}, ${vjColor}cc)`,
                    boxShadow: `0 8px 24px ${vjColor}40`,
                  }}
                >
                  <ArrowSquareOut weight="bold" size={15} />
                  Watch on {movie.source_site}
                </a>
                <button
                  onClick={() => { setTimedOut(false); setLoaded(false); setReloadKey(k => k + 1) }}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  ↺ Try again
                </button>
              </div>
            ) : (
              <iframe
                key={`tm-${id}-${reloadKey}`}
                src={movie.embed_url}
                title={movie.title}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => { setLoaded(true); setTimedOut(false) }}
              />
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setLoaded(false); setTimedOut(false); setReloadKey(k => k + 1) }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border hover:border-primary/40 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
            >
              <ArrowClockwise weight="bold" size={13} /> Reload
            </button>
            <a
              href={movie.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border hover:border-primary/40 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
            >
              <ArrowSquareOut weight="bold" size={13} /> Open on {movie.source_site}
            </a>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border hover:border-primary/40 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
            >
              <ArrowsOut weight="bold" size={13} /> Fullscreen
            </button>
          </div>

          {/* Tip */}
          <p className="text-[11px] text-gray-700 bg-surface border border-border/50 rounded-xl px-4 py-2.5 leading-relaxed">
            💡 If the player doesn't load — click <strong className="text-gray-400">Open on {movie.source_site}</strong> to watch directly on the source site.
          </p>

          {/* More by same VJ */}
          {moreByVj.length > 0 && (
            <div className="pt-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                <Microphone weight="duotone" size={14} style={{ color: vjColor }} />
                More by {movie.vj}
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {moreByVj.map(m => (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/translated/${m.id}`)}
                    className="shrink-0 w-24 text-left group"
                  >
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-surface-2 mb-1.5">
                      <img
                        src={m.poster_url}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-white truncate">{m.title}</p>
                    <p className="text-[9px] text-gray-600">{m.year}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Info sidebar ── */}
        <div className="space-y-4">
          {/* Poster + info card */}
          <div
            className="rounded-2xl overflow-hidden border border-white/6"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
          >
            <div className="relative aspect-[2/3] bg-surface-2">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div
                  className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full mb-1"
                  style={{ background: `${vjColor}30`, border: `1px solid ${vjColor}50`, color: vjColor }}
                >
                  <Microphone weight="duotone" size={10} />
                  {movie.vj}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3 bg-surface">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-white/6 border border-white/8 text-gray-400 px-2 py-0.5 rounded-full font-medium">
                  {movie.year}
                </span>
                <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary-light px-2 py-0.5 rounded-full font-medium">
                  {movie.language}
                </span>
                {movie.genre.slice(0, 2).map(g => (
                  <span key={g} className="text-[10px] bg-white/4 border border-white/6 text-gray-500 px-2 py-0.5 rounded-full">
                    {g}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 leading-relaxed">{movie.description}</p>

              {/* Source */}
              <div className="pt-1 border-t border-border/40">
                <p className="text-[10px] text-gray-700 mb-2">Source</p>
                <a
                  href={movie.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors group"
                >
                  <span className="w-5 h-5 rounded-md bg-white/6 border border-white/8 flex items-center justify-center text-[9px] font-black text-gray-500 group-hover:bg-white/10 transition-colors">
                    {movie.source_site[0]}
                  </span>
                  {movie.source_site}
                  <ArrowSquareOut weight="bold" size={11} className="ml-auto opacity-40 group-hover:opacity-100" />
                </a>
              </div>

              {/* Big CTA */}
              <a
                href={movie.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${vjColor}, ${vjColor}bb)`,
                  boxShadow: `0 4px 16px ${vjColor}30`,
                }}
              >
                <ArrowSquareOut weight="bold" size={14} />
                Watch on {movie.source_site}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

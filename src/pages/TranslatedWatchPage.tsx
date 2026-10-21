import { useParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft, SpinnerGap, ArrowsOut, ArrowClockwise,
  Play, Microphone, ArrowSquareOut,
} from '@phosphor-icons/react'
import type { VJMovie } from './TranslatedMoviesPage'

const VJ_COLORS: Record<string, string> = {
  'VJ Junior':    '#8B5CF6',
  'VJ Ice P':     '#3B82F6',
  'VJ Emmy':      '#10B981',
  'VJ Jingo':     '#EF4444',
  'VJ Muba':      '#F59E0B',
  'VJ Soul':      '#06B6D4',
  'VJ Ulio':      '#EC4899',
  'VJ Kevo':      '#6366F1',
  'VJ Ham':       '#84CC16',
  'VJ Neil':      '#F97316',
  'VJ Jovan':     '#A78BFA',
  'VJ Mark':      '#2DD4BF',
  'VJ Shield':    '#FB7185',
  'VJ Kevin':     '#FCD34D',
  'VJ Uncle T':   '#C084FC',
  'VJ Musa':      '#67E8F9',
  'VJ Tonny':     '#86EFAC',
  'VJ Mosco':     '#FCA5A5',
  'VJ Baros':     '#93C5FD',
  'VJ Kamil':     '#FDE68A',
  'Unknown VJ':   '#6B7280',
}

export default function TranslatedWatchPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const [movie, setMovie] = useState<VJMovie | null>(null)
  const [related, setRelated] = useState<VJMovie[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [playerState, setPlayerState] = useState<'loading' | 'ready' | 'fallback'>('loading')

  // Load movie from the JSON dataset
  useEffect(() => {
    setPlayerState('loading')
    fetch('/vj-movies.json')
      .then(r => r.json())
      .then((data: VJMovie[]) => {
        const found = data.find(m => m.id === id)
        setMovie(found || null)
        if (found) {
          // Related: same VJ, different movie
          const rel = data.filter(m => m.v === found.v && m.id !== found.id).slice(0, 12)
          setRelated(rel)
        }
        setLoadingData(false)
      })
      .catch(() => setLoadingData(false))
  }, [id])

  // Fallback timer — if iframe doesn't fire onLoad in 12s show fallback
  useEffect(() => {
    setPlayerState('loading')
    const t = setTimeout(() => setPlayerState('fallback'), 12000)
    return () => clearTimeout(t)
  }, [reloadKey, id])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await containerRef.current?.requestFullscreen()
    } catch { /* ignore */ }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SpinnerGap weight="bold" size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Microphone weight="duotone" size={48} className="text-gray-700" />
        <p className="text-white font-semibold">Movie not found</p>
        <button onClick={() => navigate('/translated')} className="flex items-center gap-1.5 text-primary-light text-sm hover:underline">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    )
  }

  const color = VJ_COLORS[movie.v] || '#8B5CF6'

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-8">

      {/* Back */}
      <button
        onClick={() => navigate('/translated')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-5 transition-colors group"
      >
        <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* ── Player ── */}
        <div className="lg:col-span-2 space-y-3">

          {/* Title */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight flex-1">
              {movie.t}
            </h1>
            <span
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full shrink-0"
              style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}
            >
              <Microphone weight="fill" size={11} />
              {movie.v}
            </span>
          </div>

          {/* Player box */}
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.7)' }}
          >
            {/* Loading overlay */}
            {playerState === 'loading' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-4 pointer-events-none">
                <div className="relative">
                  <SpinnerGap weight="bold" size={40} className="animate-spin" style={{ color }} />
                  <div className="absolute inset-0 blur-xl rounded-full opacity-30" style={{ background: color }} />
                </div>
                <p className="text-xs text-gray-600 font-medium tracking-wide">Loading…</p>
              </div>
            )}

            {/* Fallback overlay */}
            {playerState === 'fallback' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 p-6 text-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: `${color}20`, border: `1px solid ${color}30` }}
                >
                  <Play weight="fill" size={28} style={{ color }} />
                </div>
                <div>
                  <p className="text-white font-bold text-base mb-1">{movie.t}</p>
                  <p className="text-sm text-gray-500 max-w-xs">
                    This title needs to be opened in your browser to play.
                  </p>
                </div>
                <a
                  href={movie.u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                    boxShadow: `0 8px 28px ${color}50`,
                  }}
                >
                  <Play weight="fill" size={15} />
                  Watch Now
                  <ArrowSquareOut weight="bold" size={13} />
                </a>
                <button
                  onClick={() => { setPlayerState('loading'); setReloadKey(k => k + 1) }}
                  className="text-xs text-gray-700 hover:text-gray-400 transition-colors"
                >
                  ↺ Try again
                </button>
              </div>
            )}

            {/* Iframe — always rendered so it can load */}
            <iframe
              key={`vjm-${id}-${reloadKey}`}
              src={movie.u}
              title={movie.t}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => {
                setPlayerState('ready')
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setPlayerState('loading'); setReloadKey(k => k + 1) }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border hover:border-white/20 text-gray-400 hover:text-white text-xs font-semibold rounded-xl transition-all"
            >
              <ArrowClockwise weight="bold" size={13} /> Reload
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border hover:border-white/20 text-gray-400 hover:text-white text-xs font-semibold rounded-xl transition-all"
            >
              <ArrowsOut weight="bold" size={13} /> Fullscreen
            </button>
          </div>

          {/* ── Related movies by same VJ ── */}
          {related.length > 0 && (
            <div className="pt-2 space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
                <Microphone weight="duotone" size={14} style={{ color }} />
                More by {movie.v}
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {related.map(m => (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/translated/${m.id}`)}
                    className="shrink-0 w-[90px] text-left group"
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-1.5 relative"
                      style={{ background: `linear-gradient(135deg, ${color}15, #0d0b1a)` }}>
                      {m.p ? (
                        <img
                          src={m.p}
                          alt={m.t}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Microphone weight="duotone" size={20} style={{ color, opacity: 0.35 }} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play weight="fill" size={16} className="text-white" />
                      </div>
                    </div>
                    <p className="text-[10px] font-semibold text-white truncate leading-tight">{m.t}</p>
                    {m.y > 0 && <p className="text-[9px] text-gray-700">{m.y}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Info sidebar ── */}
        <div className="space-y-4">
          <div
            className="rounded-2xl overflow-hidden border border-white/6"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
          >
            {/* Poster */}
            <div
              className="relative w-full aspect-[2/3]"
              style={{ background: `linear-gradient(135deg, ${color}20, #0d0b1a)` }}
            >
              {movie.p ? (
                <img
                  src={movie.p}
                  alt={movie.t}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Microphone weight="duotone" size={56} style={{ color, opacity: 0.3 }} />
                </div>
              )}
              {/* VJ overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span
                  className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
                  style={{ background: `${color}30`, border: `1px solid ${color}55`, color }}
                >
                  <Microphone weight="fill" size={9} />
                  {movie.v}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="p-4 bg-surface space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {movie.y > 0 && (
                  <span className="text-[10px] bg-white/6 border border-white/8 text-gray-400 px-2 py-0.5 rounded-full font-medium">
                    {movie.y}
                  </span>
                )}
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
                >
                  Luganda
                </span>
              </div>

              <p className="text-xs font-bold text-white leading-snug">{movie.t}</p>

              {/* Watch CTA */}
              <a
                href={movie.u}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 mt-1"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                  boxShadow: `0 4px 16px ${color}30`,
                }}
              >
                <Play weight="fill" size={13} />
                Open Full Screen
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

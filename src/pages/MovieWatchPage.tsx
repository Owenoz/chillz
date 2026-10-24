import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  FilmSlate, ArrowLeft, SpinnerGap,
  ArrowSquareOut, ArrowsOut, ArrowClockwise,
} from '@phosphor-icons/react'
import { embedUrl, detailUrl } from '../lib/archiveApi'

export default function MovieWatchPage() {
  const { identifier } = useParams<{ identifier: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const title = searchParams.get('title') || 'Now Playing'
  const year  = searchParams.get('year')  || ''

  const [reloadKey, setReloadKey] = useState(0)
  const [loaded, setLoaded]       = useState(false)
  const [isFs, setIsFs]           = useState(false)

  const id = identifier ? decodeURIComponent(identifier) : ''

  useEffect(() => {
    setLoaded(false)
    const t = setTimeout(() => setLoaded(true), 8000)
    return () => clearTimeout(t)
  }, [reloadKey, id])

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

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FilmSlate weight="duotone" size={48} className="text-gray-700" />
        <p className="text-white font-semibold">Invalid movie link</p>
        <button onClick={() => navigate('/movies')} className="flex items-center gap-1.5 text-primary-light text-sm hover:underline">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    )
  }

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

      {/* Title */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight flex-1">{title}</h1>
        <div className="flex items-center gap-2">
          {year && <span className="text-xs bg-surface border border-border text-gray-400 px-2.5 py-1 rounded-full">{year}</span>}
          <span className="text-xs bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-semibold">Free</span>
        </div>
      </div>

      {/* Player */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border mb-3"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.6)' }}
      >
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
          key={`ia-${id}-${reloadKey}`}
          src={embedUrl(id)}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => { setLoaded(false); setReloadKey(k => k + 1) }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border hover:border-primary/40 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
        >
          <ArrowClockwise weight="bold" size={13} /> Reload
        </button>
        <button
          onClick={toggleFs}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border hover:border-primary/40 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
        >
          <ArrowsOut weight="bold" size={13} /> {isFs ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <a
          href={detailUrl(id)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border hover:border-primary/40 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
        >
          <ArrowSquareOut weight="bold" size={13} /> Open Full Page
        </a>
      </div>
    </div>
  )
}

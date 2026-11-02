import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft, SpinnerGap, ArrowsOut, ArrowClockwise,
  FilmSlate, Star, Television, Play,
} from '@phosphor-icons/react'
import { buildVidsrcUrl } from '../lib/tmdbApi'
import { saveContinueWatching } from '../lib/watchlist'

export default function TMDBWatchPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const tmdbId = Number(id)
  const type    = (searchParams.get('type') || 'movie') as 'movie' | 'tv'
  const title   = searchParams.get('title')  || 'Now Playing'
  const poster  = searchParams.get('poster') || ''
  const year    = searchParams.get('year')   || ''
  const rating  = searchParams.get('rating') || ''
  const plot    = searchParams.get('plot')   || ''

  const isTv = type === 'tv'
  const [season,  setSeason]  = useState(1)
  const [episode, setEpisode] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [loaded, setLoaded]   = useState(false)
  const [isFs, setIsFs]       = useState(false)

  const embedUrl = buildVidsrcUrl(tmdbId, type, season, episode)

  useEffect(() => {
    if (!tmdbId || !title) return
    saveContinueWatching({
      item_id:    `tmdb-${tmdbId}`,
      item_type:  isTv ? 'tv_series' : 'movie',
      item_title: title,
      item_poster: poster,
      item_url:   `/movies/tmdb/${tmdbId}?type=${type}&title=${encodeURIComponent(title)}&poster=${encodeURIComponent(poster)}&year=${year}&rating=${rating}&plot=${encodeURIComponent(plot)}`,
      season:  isTv ? season : undefined,
      episode: isTv ? episode : undefined,
    })
  }, [tmdbId, season, episode])

  useEffect(() => {
    setLoaded(false)
    const t = setTimeout(() => setLoaded(true), 10000)
    return () => clearTimeout(t)
  }, [reloadKey, season, episode, tmdbId])

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

  if (!tmdbId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FilmSlate weight="duotone" size={48} className="text-muted opacity-40" />
        <button onClick={() => navigate('/movies')} className="text-primary-light text-sm hover:underline flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    )
  }

  return (
    <div className="bg-mesh min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 py-4">

        <button onClick={() => navigate('/movies')}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-white mb-5 transition-colors group">
          <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Movies
        </button>

        {/* Title */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-xl md:text-2xl font-black text-white leading-tight flex-1">{title}</h1>
          <div className="flex items-center gap-2">
            {year && <span className="text-xs text-muted bg-surface border border-border px-2.5 py-1 rounded-full">{year}</span>}
            {rating && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                <Star weight="fill" size={10} /> {rating}
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: isTv ? 'rgba(6,182,212,0.15)' : 'rgba(124,58,237,0.15)', border: isTv ? '1px solid rgba(6,182,212,0.3)' : '1px solid rgba(124,58,237,0.3)', color: isTv ? '#22D3EE' : '#A78BFA' }}>
              {isTv ? 'TV Series' : 'Movie'}
            </span>
          </div>
        </div>

        {/* Player */}
        <div ref={containerRef}
          className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border mb-3"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.7)' }}>
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-4 pointer-events-none">
              <div className="relative">
                <SpinnerGap weight="bold" size={40} className="text-primary animate-spin" />
                <div className="absolute inset-0 rounded-full blur-xl opacity-25" style={{ background: '#7C3AED' }} />
              </div>
              <p className="text-xs text-muted font-medium tracking-wide">Loading player…</p>
            </div>
          )}
          <iframe
            key={`tmdb-${tmdbId}-s${season}e${episode}-${reloadKey}`}
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setLoaded(true)}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button onClick={() => { setLoaded(false); setReloadKey(k => k + 1) }}
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

        {/* TV episode picker */}
        {isTv && (
          <div className="rounded-2xl p-4 mb-4"
            style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Television weight="duotone" size={15} className="text-primary-light" /> Episode Selector
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">Season</span>
                <input type="number" min={1} value={season}
                  onChange={e => { setSeason(Math.max(1, Number(e.target.value) || 1)); setLoaded(false) }}
                  className="w-16 rounded-xl px-2 py-2 text-white text-center text-sm font-semibold focus:outline-none"
                  style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
              </label>
              <label className="flex items-center gap-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">Episode</span>
                <input type="number" min={1} value={episode}
                  onChange={e => { setEpisode(Math.max(1, Number(e.target.value) || 1)); setLoaded(false) }}
                  className="w-16 rounded-xl px-2 py-2 text-white text-center text-sm font-semibold focus:outline-none"
                  style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
              </label>
              <button onClick={() => { setEpisode(e => e + 1); setLoaded(false) }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 4px 12px rgba(124,58,237,0.4)' }}>
                <Play weight="fill" size={12} /> Next
              </button>
            </div>
          </div>
        )}

        {/* Movie info */}
        {(poster || plot) && (
          <div className="flex gap-4 rounded-2xl p-4"
            style={{ background: 'rgba(19,17,28,0.6)', border: '1px solid rgba(45,38,69,0.5)' }}>
            {poster && (
              <img src={poster} alt={title}
                className="w-16 h-24 object-cover rounded-xl shrink-0"
                onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
            )}
            <div>
              <p className="text-sm font-black text-white mb-1">{title}</p>
              {year && <p className="text-xs text-muted mb-2">{year} · {isTv ? 'TV Series' : 'Movie'}</p>}
              {plot && <p className="text-[11px] text-muted leading-relaxed line-clamp-3">{plot}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

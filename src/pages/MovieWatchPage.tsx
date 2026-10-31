import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  FilmSlate, ArrowLeft, SpinnerGap,
  ArrowSquareOut, ArrowsOut, ArrowClockwise,
  BookmarkSimple, Check,
} from '@phosphor-icons/react'
import { embedUrl, detailUrl } from '../lib/archiveApi'
import { saveContinueWatching, addToWatchlist, isInWatchlist } from '../lib/watchlist'
import { useAuth } from '../contexts/AuthContext'

export default function MovieWatchPage() {
  const { identifier } = useParams<{ identifier: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const title  = searchParams.get('title')  || 'Now Playing'
  const year   = searchParams.get('year')   || ''
  const poster = searchParams.get('poster') || ''

  const [reloadKey, setReloadKey]     = useState(0)
  const [loaded, setLoaded]           = useState(false)
  const [isFs, setIsFs]               = useState(false)
  const [bookmarked, setBookmarked]   = useState(false)
  const [bookmarkBusy, setBookmarkBusy] = useState(false)

  const id = identifier ? decodeURIComponent(identifier) : ''

  // Auto-save to continue watching when page opens
  useEffect(() => {
    if (!id || !title) return
    saveContinueWatching({
      item_id:    id,
      item_type:  'movie',
      item_title: title,
      item_poster: poster,
      item_url:   `/movies/watch/${encodeURIComponent(id)}?title=${encodeURIComponent(title)}&year=${year}&poster=${encodeURIComponent(poster)}`,
    })
  }, [id])

  // Check if already bookmarked
  useEffect(() => {
    if (!user || !id) return
    isInWatchlist(user.id, id, 'movie').then(setBookmarked)
  }, [user, id])

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

  const toggleBookmark = async () => {
    if (!user) { navigate('/profile'); return }
    setBookmarkBusy(true)
    const ok = await addToWatchlist(user.id, {
      item_id:    id,
      item_type:  'movie',
      item_title: title,
      item_poster: poster,
      item_url:   `/movies/watch/${encodeURIComponent(id)}?title=${encodeURIComponent(title)}&year=${year}&poster=${encodeURIComponent(poster)}`,
    })
    if (ok) setBookmarked(true)
    setBookmarkBusy(false)
  }

  const toggleFs = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await containerRef.current?.requestFullscreen()
    } catch { /* ignore */ }
  }

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FilmSlate weight="duotone" size={48} className="text-muted opacity-40" />
        <p className="text-white font-semibold">Invalid movie link</p>
        <button onClick={() => navigate('/movies')}
          className="flex items-center gap-1.5 text-primary-light text-sm hover:underline">
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
          Back to movies
        </button>

        {/* Title + actions */}
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight">{title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {year && <span className="text-xs text-muted">{year}</span>}
              <span className="text-xs bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">Free</span>
            </div>
          </div>
          <button onClick={toggleBookmark} disabled={bookmarkBusy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: bookmarked ? 'rgba(124,58,237,0.2)' : 'rgba(19,17,28,0.8)',
              border: `1px solid ${bookmarked ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.6)'}`,
              color: bookmarked ? '#A78BFA' : '#7C7A91',
            }}>
            {bookmarked
              ? <><Check weight="bold" size={14} /> Saved</>
              : <><BookmarkSimple weight="bold" size={14} /> Save</>
            }
          </button>
        </div>

        {/* Player */}
        <div ref={containerRef}
          className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border mb-3"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.6)' }}>
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-4 pointer-events-none">
              <div className="relative">
                <SpinnerGap weight="bold" size={36} className="text-primary animate-spin" />
                <div className="absolute inset-0 rounded-full blur-lg bg-primary/20" />
              </div>
              <p className="text-xs text-muted font-medium">Loading player…</p>
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
        <div className="flex flex-wrap items-center gap-2">
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
          <a href={detailUrl(id)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all"
            style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
            <ArrowSquareOut weight="bold" size={13} /> Open Full Page
          </a>
        </div>
      </div>
    </div>
  )
}

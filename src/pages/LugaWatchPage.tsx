import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft, ArrowsOut,
  Microphone, SpinnerGap, Play, Pause,
  SpeakerHigh, SpeakerSlash, SkipBack, SkipForward,
  Translate,
} from '@phosphor-icons/react'
import { saveContinueWatching } from '../lib/watchlist'

function fmtTime(s: number): string {
  if (!s || isNaN(s)) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${m}:${String(sec).padStart(2,'0')}`
}

export default function LugaWatchPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const title  = searchParams.get('title')  || 'Now Playing'
  const poster = searchParams.get('poster') || ''
  const vj     = searchParams.get('vj')     || ''
  const mp4Url = searchParams.get('url')    || ''

  const videoRef    = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ctrlTimer   = useRef<ReturnType<typeof setTimeout>>()

  const [playing, setPlaying]     = useState(false)
  const [current, setCurrent]     = useState(0)
  const [duration, setDuration]   = useState(0)
  const [buffered, setBuffered]   = useState(0)
  const [buffering, setBuffering] = useState(false)
  const [muted, setMuted]         = useState(false)
  const [showCtrl, setShowCtrl]   = useState(true)
  const [error, setError]         = useState('')

  // Save continue watching on mount
  useEffect(() => {
    if (!id || !mp4Url) return
    saveContinueWatching({
      item_id:    `luga-${id}`,
      item_type:  'movie',
      item_title: title,
      item_poster: poster,
      item_url:   `/movies/luga/${id}?title=${encodeURIComponent(title)}&poster=${encodeURIComponent(poster)}&vj=${encodeURIComponent(vj)}&url=${encodeURIComponent(mp4Url)}`,
    })
  }, [id])

  // Video event listeners
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => setCurrent(v.currentTime)
    const onDur  = () => setDuration(v.duration)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onWait = () => setBuffering(true)
    const onPlaying = () => setBuffering(false)
    const onProgress = () => {
      if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1))
    }
    const onErr = () => setError('Could not load this video. It may have been removed or the link has expired.')
    const onFull = () => {}
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onDur)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('waiting', onWait)
    v.addEventListener('playing', onPlaying)
    v.addEventListener('progress', onProgress)
    v.addEventListener('error', onErr)
    document.addEventListener('fullscreenchange', onFull)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onDur)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('waiting', onWait)
      v.removeEventListener('playing', onPlaying)
      v.removeEventListener('progress', onProgress)
      v.removeEventListener('error', onErr)
      document.removeEventListener('fullscreenchange', onFull)
    }
  }, [mp4Url])

  // Auto-hide controls
  const bumpControls = () => {
    setShowCtrl(true)
    clearTimeout(ctrlTimer.current)
    ctrlTimer.current = setTimeout(() => {
      if (playing) setShowCtrl(false)
    }, 3500)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current
      if (!v || e.target instanceof HTMLInputElement) return
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break
        case 'ArrowRight': v.currentTime = Math.min(v.currentTime + 15, v.duration); break
        case 'ArrowLeft':  v.currentTime = Math.max(v.currentTime - 15, 0); break
        case 'm': v.muted = !v.muted; setMuted(v.muted); break
        case 'f': toggleFullscreen(); break
      }
      bumpControls()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    playing ? v.pause() : v.play()
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(() => {})
    } else {
      await document.exitFullscreen()
    }
  }

  const pct    = duration ? (current / duration) * 100 : 0
  const bufPct = duration ? (buffered / duration) * 100 : 0

  if (!mp4Url) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Microphone weight="duotone" size={48} className="text-muted opacity-40" />
        <p className="text-white font-semibold">Invalid movie link</p>
        <button onClick={() => navigate('/movies')} className="text-primary-light text-sm hover:underline flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen">

      {/* ── Full-screen native player ── */}
      <div
        ref={containerRef}
        className="relative w-full bg-black"
        style={{ height: '100svh', maxHeight: '100dvh' }}
        onMouseMove={bumpControls}
        onTouchStart={bumpControls}
        onClick={togglePlay}
      >
        {/* Native video */}
        <video
          ref={videoRef}
          src={mp4Url}
          poster={poster || undefined}
          className="w-full h-full object-contain"
          playsInline
          preload="auto"
          crossOrigin="anonymous"
        />

        {/* Buffering spinner */}
        {buffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30">
            <div className="relative">
              <SpinnerGap weight="bold" size={48} className="text-white animate-spin" />
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4 px-6 text-center" onClick={e => e.stopPropagation()}>
            <Microphone weight="duotone" size={48} className="text-muted opacity-40" />
            <p className="text-white font-bold">Can't play this video</p>
            <p className="text-muted text-sm max-w-xs">{error}</p>
            <button onClick={() => { setError(''); if (videoRef.current) videoRef.current.load() }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
              Try again
            </button>
            <button onClick={() => navigate('/movies')} className="text-muted text-sm hover:text-white">
              ← Back to Movies
            </button>
          </div>
        )}

        {/* Controls overlay */}
        <div
          className="absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none"
          style={{ opacity: showCtrl ? 1 : 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top bar */}
          <div className="pointer-events-auto p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)' }}>
            <button onClick={() => navigate('/movies')}
              className="w-9 h-9 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all">
              <ArrowLeft weight="bold" size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm truncate">{title}</p>
              {vj && (
                <p className="text-[11px] text-white/60 flex items-center gap-1 mt-0.5">
                  <Translate weight="duotone" size={10} /> {vj}
                </p>
              )}
            </div>
          </div>

          {/* Centre play/pause area */}
          <div className="pointer-events-auto flex items-center justify-center gap-10">
            {/* Rewind 15s */}
            <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 15; bumpControls() }}
              className="w-12 h-12 flex items-center justify-center text-white/90 hover:text-white transition-colors">
              <SkipBack weight="fill" size={28} />
            </button>

            {/* Play / Pause */}
            <button onClick={togglePlay}
              className="w-20 h-20 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all border border-white/20">
              {playing
                ? <Pause weight="fill" size={32} className="text-white" />
                : <Play  weight="fill" size={32} className="text-white translate-x-0.5" />
              }
            </button>

            {/* Forward 15s */}
            <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 15; bumpControls() }}
              className="w-12 h-12 flex items-center justify-center text-white/90 hover:text-white transition-colors">
              <SkipForward weight="fill" size={28} />
            </button>
          </div>

          {/* Bottom bar */}
          <div className="pointer-events-auto p-4 space-y-2"
            style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.85),transparent)' }}>
            {/* Progress bar */}
            <div className="relative h-1.5 rounded-full cursor-pointer group/prog"
              style={{ background: 'rgba(255,255,255,0.25)' }}
              onClick={seek}>
              {/* Buffered */}
              <div className="absolute h-full rounded-full transition-all"
                style={{ width: `${bufPct}%`, background: 'rgba(255,255,255,0.4)' }} />
              {/* Played */}
              <div className="absolute h-full rounded-full"
                style={{ width: `${pct}%`, background: 'linear-gradient(to right,#7C3AED,#A78BFA)' }} />
              {/* Thumb */}
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg transition-opacity opacity-0 group-hover/prog:opacity-100"
                style={{ left: `calc(${pct}% - 8px)` }} />
            </div>

            {/* Time + controls row */}
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm font-medium tabular-nums">
                {fmtTime(current)} / {fmtTime(duration)}
              </span>
              <div className="flex items-center gap-3">
                <button onClick={toggleMute}
                  className="text-white/80 hover:text-white transition-colors">
                  {muted
                    ? <SpeakerSlash weight="fill" size={20} />
                    : <SpeakerHigh  weight="fill" size={20} />
                  }
                </button>
                <button onClick={toggleFullscreen}
                  className="text-white/80 hover:text-white transition-colors">
                  <ArrowsOut weight="fill" size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tap hint on mobile */}
        {!showCtrl && !playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <Play weight="fill" size={32} className="text-white translate-x-0.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import Hls from 'hls.js'
import {
  Radio, Play, Pause, SpeakerHigh, SpeakerSlash,
  SpinnerGap, WarningCircle, MusicNote,
} from '@phosphor-icons/react'
import { RADIO_STATIONS, type RadioStation } from '../data/uganda_extras'

export default function RadioPage() {
  const [active, setActive]   = useState<RadioStation | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [muted, setMuted]     = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const hlsRef   = useRef<Hls | null>(null)

  const play = (station: RadioStation) => {
    setActive(station)
    setError('')
    setLoading(true)
    setPlaying(false)
  }

  useEffect(() => {
    if (!active) return
    const audio = audioRef.current
    if (!audio) return
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    audio.pause()

    const url = active.stream_url
    const isHls = url.includes('.m3u8')

    const onPlay  = () => { setPlaying(true);  setLoading(false) }
    const onPause = () => setPlaying(false)
    const onErr   = () => {
      setLoading(false)
      setError('Stream unavailable. Trying YouTube fallback…')
    }

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true })
      hls.loadSource(url)
      hls.attachMedia(audio)
      hls.on(Hls.Events.MANIFEST_PARSED, () => { audio.play().catch(() => {}) })
      hls.on(Hls.Events.ERROR, (_e, d) => { if (d.fatal) onErr() })
      hlsRef.current = hls
    } else if (isHls && audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = url
      audio.play().catch(onErr)
    } else {
      audio.src = url
      audio.play().catch(onErr)
    }

    audio.addEventListener('playing', onPlay, { once: false })
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onErr, { once: true })

    return () => {
      audio.removeEventListener('playing', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onErr)
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    }
  }, [active])

  const togglePlay = () => {
    const a = audioRef.current
    if (!a) return
    playing ? a.pause() : a.play()
  }

  const toggleMute = () => {
    const a = audioRef.current
    if (!a) return
    a.muted = !a.muted
    setMuted(a.muted)
  }

  return (
    <div className="bg-mesh min-h-screen pb-24">

      {/* ── Header ── */}
      <div className="relative overflow-hidden border-b border-border/40"
        style={{ background: 'linear-gradient(180deg,rgba(124,58,237,0.12) 0%,transparent 100%)' }}>
        <div className="max-w-7xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-sm"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
              <Radio weight="fill" size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Uganda Radio</h1>
              <p className="text-muted text-sm">{RADIO_STATIONS.length} stations · Free · Works on 2G</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hidden audio element ── */}
      <audio ref={audioRef} preload="none" />

      {/* ── Now Playing bar ── */}
      {active && (
        <div className="sticky top-14 z-30 mx-4 mt-4 rounded-2xl p-3 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(19,17,28,0.98))', border: '1px solid rgba(124,58,237,0.4)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-2 shrink-0">
            {active.logo
              ? <img src={active.logo} alt={active.name} className="w-full h-full object-cover"
                  onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')} />
              : <div className="w-full h-full flex items-center justify-center"><Radio weight="duotone" size={22} className="text-primary-light opacity-60"/></div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white truncate">{active.name}</p>
            <p className="text-[10px] text-muted truncate">{active.genre}</p>
          </div>
          {loading && <SpinnerGap weight="bold" size={20} className="text-primary animate-spin shrink-0"/>}
          {error && !active.embed_url && <WarningCircle weight="duotone" size={20} className="text-amber-500 shrink-0"/>}
          <button onClick={toggleMute} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            {muted ? <SpeakerSlash weight="fill" size={14} className="text-white"/> : <SpeakerHigh weight="fill" size={14} className="text-white"/>}
          </button>
          <button onClick={togglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 4px 12px rgba(124,58,237,0.5)' }}>
            {playing ? <Pause weight="fill" size={16} className="text-white"/> : <Play weight="fill" size={16} className="text-white translate-x-0.5"/>}
          </button>

          {/* YouTube fallback iframe if stream fails */}
          {error && active.embed_url && (
            <div className="absolute left-0 right-0 bottom-0 translate-y-full pt-2 px-4">
              <iframe src={active.embed_url} className="w-full" style={{ height: 0 }}
                allow="autoplay; encrypted-media" title={active.name}
                onLoad={() => { setError(''); setPlaying(true); setLoading(false) }} />
            </div>
          )}
        </div>
      )}

      {/* ── Station grid ── */}
      <div className="max-w-7xl mx-auto px-5 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {RADIO_STATIONS.map(station => {
            const isActive = active?.id === station.id
            return (
              <button key={station.id} onClick={() => play(station)}
                className="group relative overflow-hidden rounded-2xl p-4 text-left transition-all hover:-translate-y-1"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(19,17,28,0.95))'
                    : 'rgba(19,17,28,0.8)',
                  border: `2px solid ${isActive ? 'rgba(124,58,237,0.6)' : 'rgba(45,38,69,0.6)'}`,
                  boxShadow: isActive ? '0 0 24px rgba(124,58,237,0.3)' : '0 4px 16px rgba(0,0,0,0.4)',
                }}>
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-2 mb-3 mx-auto flex items-center justify-center">
                  {station.logo
                    ? <img src={station.logo} alt={station.name} className="w-full h-full object-cover"
                        onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')} />
                    : <Radio weight="duotone" size={28} className="text-primary-light opacity-50"/>}
                </div>
                <p className="text-sm font-black text-white text-center truncate">{station.name}</p>
                <p className="text-[10px] text-muted text-center mt-0.5 truncate">{station.frequency}</p>
                <p className="text-[9px] text-muted text-center mt-0.5 line-clamp-1">{station.genre}</p>

                {isActive && playing && (
                  <div className="flex items-center justify-center gap-0.5 mt-2">
                    {[1,2,3,4,5].map(b => (
                      <div key={b} className="w-0.5 rounded-full bg-primary-light"
                        style={{ height: `${8 + Math.random()*12}px`, animation: `live-pulse ${0.8 + Math.random()*0.4}s ease-in-out infinite`, animationDelay: `${b*0.1}s` }} />
                    ))}
                  </div>
                )}
                {isActive && loading && (
                  <div className="flex justify-center mt-2">
                    <SpinnerGap weight="bold" size={16} className="text-primary animate-spin"/>
                  </div>
                )}
                {!isActive && (
                  <div className="flex justify-center mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted group-hover:text-primary-light transition-colors">
                      <MusicNote weight="fill" size={10}/> Listen
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

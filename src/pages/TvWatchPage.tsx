import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { Television, ArrowLeft, ArrowSquareOut, Globe, WarningCircle, SpinnerGap } from '@phosphor-icons/react'
import channelsData from '../data/tv_channels.json'
import type { TvChannel } from '../data/types'
import { saveContinueWatching } from '../lib/watchlist'

const channels = channelsData as TvChannel[]

// ─── YouTube URL → embed URL ───────────────────────────────────────────────
function toYouTubeEmbed(raw: string): string {
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    let vid = ''
    if (u.hostname === 'youtu.be') vid = u.pathname.slice(1).split('?')[0]
    else if (u.pathname.startsWith('/watch')) vid = u.searchParams.get('v') || ''
    else if (/^\/(live|embed|shorts)\//.test(u.pathname)) vid = u.pathname.split('/')[2]
    if (vid) return `https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&mute=1&playsinline=1&rel=0`
  } catch { /* fall through */ }
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw.trim()))
    return `https://www.youtube-nocookie.com/embed/${raw.trim()}?autoplay=1&mute=1&playsinline=1&rel=0`
  return raw
}


export default function TvWatchPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [playerState, setPlayerState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [sidebarSearch, setSidebarSearch] = useState('')

  const channel = channels.find((c) => c.id === id)
  const activeChannels = channels.filter((c) => c.active)

  // Save to continue watching when channel opens
  useEffect(() => {
    if (!channel) return
    saveContinueWatching({
      item_id:    channel.id,
      item_type:  'channel',
      item_title: channel.title,
      item_poster: channel.poster_url || '',
      item_url:   `/tv/watch/${channel.id}`,
    })
  }, [id])
  const currentIndex = activeChannels.findIndex((c) => c.id === id)

  // Sidebar channels — show 40 nearest + filter by search
  const sidebarChannels = activeChannels
    .filter((c) => c.id !== id)
    .filter((c) =>
      !sidebarSearch || c.title.toLowerCase().includes(sidebarSearch.toLowerCase())
    )
    .slice(sidebarSearch ? 0 : Math.max(0, currentIndex - 3), sidebarSearch ? 50 : currentIndex + 40)

  // ── HLS player setup ──────────────────────────────────────────────────────
  const setupHls = useCallback(() => {
    const video = videoRef.current
    if (!channel || !video || channel.source_type !== 'hls') return

    setPlayerState('loading')
    setErrorMsg('')

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    const markReady = () => setPlayerState('ready')
    const markError = (msg = 'This channel is temporarily unavailable. Please try another or hit Retry.') => {
      setPlayerState('error')
      setErrorMsg(msg)
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true,
        maxBufferLength: 30,
        backBufferLength: 10,
      })
      hls.loadSource(channel.source_url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
        markReady()
      })
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad()
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError()
        } else {
          markError()
        }
      })
      hlsRef.current = hls
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = channel.source_url
      const onLoad = () => markReady()
      const onErr = () => markError()
      video.addEventListener('loadeddata', onLoad, { once: true })
      video.addEventListener('error', onErr, { once: true })
      video.play().catch(() => {})
    } else {
      markError('Your browser cannot play HLS streams. Try Chrome or Firefox.')
    }
  }, [channel, retryKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setupHls()
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [setupHls])

  // Reset iframe loaded state when channel changes
  useEffect(() => {
    setIframeLoaded(false)
    setPlayerState('loading')
    setErrorMsg('')

    // For iframe/youtube embeds: fallback after 12s.
    // If the iframe fires onLoad quickly → spinner clears normally.
    // If it never fires (connection refused, 451, etc.) → show error UI.
    if (channel && channel.source_type !== 'hls') {
      const timer = setTimeout(() => {
        setIframeLoaded(false)
        setPlayerState('error')
        setErrorMsg('This channel is unavailable in your region or has been taken down. Try opening it in a new tab or choose another channel.')
      }, 12000)
      return () => clearTimeout(timer)
    }
  }, [id, channel])

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 gap-3">
        <Television weight="duotone" size={48} className="text-gray-700" />
        <p className="font-semibold">Channel not found</p>
        <button onClick={() => navigate('/tv')} className="text-primary-light hover:underline text-sm">
          <ArrowLeft weight="bold" size={14} /> Back to channels
        </button>
      </div>
    )
  }

  const isEmbed = channel.source_type === 'iframe'
  const isYouTube = channel.source_type === 'youtube'
  const isHls = channel.source_type === 'hls'

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-6">
      {/* Back */}
      <button
        onClick={() => navigate('/tv')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft weight="bold" size={14} /> Back to channels
      </button>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* ── Player column ── */}
        <div className="lg:col-span-2 space-y-3">

          {/* Player box */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border">

            {/* ── HLS ── */}
            {isHls && (
              <>
                <video
                  ref={videoRef}
                  key={retryKey}
                  className="absolute inset-0 w-full h-full"
                  controls
                  autoPlay
                  muted
                  playsInline
                  poster={channel.poster_url || undefined}
                />
                {/* Loading spinner — only while loading */}
                {playerState === 'loading' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-none gap-3">
                    <SpinnerGap weight="bold" size={32} className="text-primary animate-spin" />
                    <p className="text-xs text-gray-500">Loading stream…</p>
                  </div>
                )}
                {/* Error state */}
                {playerState === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-6 text-center gap-3">
                    <WarningCircle weight="duotone" size={32} className="text-amber-500" />
                    <p className="text-sm text-gray-300 max-w-xs">{errorMsg}</p>
                    <button
                      onClick={() => setRetryKey((k) => k + 1)}
                      className="px-5 py-2 bg-primary hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      ↺ Retry
                    </button>
                    <button
                      onClick={() => navigate('/tv')}
                      className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                    >
                      Browse other channels
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── YouTube ── */}
            {isYouTube && (
              <>
                {playerState === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-6 text-center gap-3 z-20">
                    <WarningCircle weight="duotone" size={32} className="text-amber-500" />
                    <p className="text-sm text-gray-300 max-w-xs">{errorMsg}</p>
                    <a
                      href={channel.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 bg-primary hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      ↗ Open in new tab
                    </a>
                    <button onClick={() => navigate('/tv')} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                      Browse other channels
                    </button>
                  </div>
                )}
                {!iframeLoaded && playerState !== 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-none z-10">
                    <SpinnerGap weight="bold" size={32} className="text-primary animate-spin" />
                  </div>
                )}
                {playerState !== 'error' && (
                  <iframe
                    key={`yt-${id}-${retryKey}`}
                    ref={iframeRef}
                    src={toYouTubeEmbed(channel.source_url)}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture; accelerometer; encrypted-media; gyroscope"
                    allowFullScreen
                    onLoad={() => { setIframeLoaded(true); setPlayerState('ready') }}
                  />
                )}
              </>
            )}

            {/* ── Generic iframe embed (zlive.st etc.) ── */}
            {isEmbed && (
              <>
                {playerState === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-6 text-center gap-3 z-20">
                    <WarningCircle weight="duotone" size={32} className="text-amber-500" />
                    <p className="text-sm text-gray-300 max-w-xs">{errorMsg}</p>
                    <a
                      href={channel.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 bg-primary hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      ↗ Open in new tab
                    </a>
                    <button onClick={() => { setPlayerState('loading'); setIframeLoaded(false); setRetryKey((k) => k + 1) }}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                      ↺ Retry anyway
                    </button>
                    <button onClick={() => navigate('/tv')} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                      Browse other channels
                    </button>
                  </div>
                )}
                {!iframeLoaded && playerState !== 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-none z-10 gap-3">
                    <SpinnerGap weight="bold" size={32} className="text-primary animate-spin" />
                    <p className="text-xs text-gray-500">Loading player…</p>
                  </div>
                )}
                {playerState !== 'error' && (
                  <iframe
                    key={`embed-${id}-${retryKey}`}
                    ref={iframeRef}
                    src={channel.source_url}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; clipboard-write"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    onLoad={() => {
                      setIframeLoaded(true)
                      setPlayerState('ready')
                    }}
                  />
                )}
              </>
            )}
          </div>

          {/* Controls bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setIframeLoaded(false)
                setRetryKey((k) => k + 1)
              }}
              className="px-3 py-1.5 bg-surface border border-border hover:border-primary/50 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
            >
              ↺ Reload
            </button>
            {(isEmbed || isYouTube) && (
              <a
                href={channel.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-surface border border-border hover:border-primary/50 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
              >
                ↗ Open in new tab
              </a>
            )}
            <button
              onClick={() => {
                const el = document.querySelector('.player-container') as HTMLElement
                el?.requestFullscreen?.().catch(() => {})
              }}
              className="px-3 py-1.5 bg-surface border border-border hover:border-primary/50 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
            >
              ⛶ Fullscreen
            </button>
          </div>

          {/* Channel info card */}
          <div className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3">
            {channel.poster_url && (
              <img
                src={channel.poster_url}
                alt={channel.title}
                className="w-14 h-14 rounded-lg object-cover shrink-0 bg-surface-2"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-base font-bold text-white">{channel.title}</h1>
                <span className="flex items-center gap-1 bg-red-600/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-900/40">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot" /> LIVE
                </span>
              </div>
              {channel.description && channel.description !== channel.title && (
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{channel.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                {channel.country && <span className="flex items-center gap-1"><Globe weight="duotone" size={12} />{channel.country}</span>}
                <span className="uppercase font-medium">{channel.source_type === 'hls' ? 'HLS stream' : channel.source_type === 'youtube' ? 'YouTube Live' : 'Embedded player'}</span>
                <span>Channel #{channel.display_order}</span>
              </div>
              {isEmbed && (
                <p className="text-xs text-gray-600 mt-2 bg-surface-2 border border-border rounded-lg px-3 py-2">
                  💡 If the screen is black, tap <strong className="text-gray-400"><ArrowLeft weight="bold" size={13} className="rotate-[135deg]" /> Reload</strong> or try <strong className="text-gray-400"><ArrowSquareOut weight="bold" size={13} /> Open in new tab</strong>. Some embed channels require a moment to initialise.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400">More Channels</h2>
            <span className="text-xs text-gray-600">{activeChannels.length} total</span>
          </div>

          {/* Search within sidebar */}
          <input
            type="text"
            placeholder="Filter channels…"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
          />

          <div className="space-y-1.5 max-h-[65vh] overflow-y-auto pr-0.5">
            {sidebarChannels.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-4">No channels found</p>
            ) : (
              sidebarChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => navigate(`/tv/watch/${ch.id}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-border hover:border-primary/40 hover:bg-surface-2 transition-all text-left group"
                >
                  <div className="w-14 h-9 rounded-lg overflow-hidden bg-surface-2 shrink-0">
                    {ch.poster_url ? (
                      <img
                        src={ch.poster_url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Television weight="duotone" size={20} className="text-gray-700" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-primary-light transition-colors">
                      {ch.title}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      {ch.country || ch.source_type.toUpperCase()}
                    </p>
                  </div>
                  {/* Live dot */}
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 live-dot" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

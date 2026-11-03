import { useState } from 'react'
import { Newspaper, Play, ArrowLeft, ArrowClockwise } from '@phosphor-icons/react'

interface NewsChannel {
  id: string
  name: string
  logo: string
  description: string
  youtube_channel_id: string
  hls_url?: string
  color: string
}

const NEWS_CHANNELS: NewsChannel[] = [
  {
    id: 'ntv',
    name: 'NTV Uganda',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/NTV_Uganda_logo.png/320px-NTV_Uganda_logo.png',
    description: 'NTV Uganda — Nation Media Group. Live news, current affairs & entertainment.',
    youtube_channel_id: 'UCTsAJZY5B9MLQMvG1lMwCOw',
    hls_url: 'https://ams-2629.antmedia.cloud/LiveApp/play.html?id=abul2026',
    color: '#dc2626',
  },
  {
    id: 'nbs',
    name: 'NBS TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/NBS_TV_Logo.png/320px-NBS_TV_Logo.png',
    description: 'NBS TV Uganda — Next Media Group. Breaking news and in-depth analysis.',
    youtube_channel_id: 'UCIcdkdxBHT5jJRKB_x4rbrg',
    hls_url: 'https://ams-2629.antmedia.cloud/LiveApp/play.html?id=nbslive',
    color: '#1d4ed8',
  },
  {
    id: 'bbs',
    name: 'BBS TV',
    logo: 'https://i.imgur.com/5uUjC1M.png',
    description: 'BBS Terefayena — Buganda Kingdom broadcaster. News in Luganda.',
    youtube_channel_id: 'UCkHoAmi6qnLPYeV6ezgfYbw',
    hls_url: 'https://bbstv.ug/hls/ch01/index.m3u8',
    color: '#92400e',
  },
  {
    id: 'bukedde',
    name: 'Bukedde TV',
    logo: 'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791489780023-zdf6z6.png',
    description: 'Bukedde TV 1 — New Vision Group. Luganda news and programming.',
    youtube_channel_id: 'UCnHQU9q_Vw-ixBHTJg-0Hkw',
    hls_url: 'https://stream.hydeinnovations.com/bukedde1flussonic/index.m3u8',
    color: '#7c3aed',
  },
  {
    id: 'spark',
    name: 'Spark TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Spark_TV_Uganda_logo.png/320px-Spark_TV_Uganda_logo.png',
    description: 'Spark TV — Next Media Group. Entertainment & news for the youth.',
    youtube_channel_id: 'UC8bIH6hXSVGh8M6-iasGhJg',
    hls_url: 'https://live.esteem.africa/live/kstv-uganda-a3023c.m3u8',
    color: '#f59e0b',
  },
  {
    id: 'galaxy',
    name: 'Galaxy TV',
    logo: 'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791488030531-h499k8.png',
    description: 'Galaxy TV Uganda — Entertainment, music and news.',
    youtube_channel_id: 'UCq3FeSHy5M-AMIwLUQiEijw',
    hls_url: 'https://livestream.galaxytv.ug/jikonkone/playlist.m3u8',
    color: '#0891b2',
  },
]

function ytLiveEmbed(channelId: string) {
  return `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=1&rel=0&modestbranding=1`
}

export default function NewsPage() {
  const [active, setActive]   = useState<NewsChannel | null>(null)
  const [loaded, setLoaded]   = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [useHls, setUseHls]   = useState(false)

  if (active) {
    const embedSrc = useHls && active.hls_url
      ? active.hls_url
      : ytLiveEmbed(active.youtube_channel_id)

    return (
      <div className="bg-mesh min-h-screen pb-24">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => { setActive(null); setLoaded(false); setUseHls(false) }}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-white mb-4 transition-colors group">
            <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform"/>
            Back to News
          </button>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <img src={active.logo} alt={active.name}
              className="w-10 h-10 object-contain rounded-xl bg-surface-2 p-1 border border-border"
              onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')}/>
            <h1 className="text-xl font-black text-white flex-1">{active.name}</h1>
            <span className="flex items-center gap-1.5 text-xs font-black text-red-400 bg-red-500/15 border border-red-500/25 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot"/> LIVE
            </span>
          </div>

          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border mb-3"
            style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.7)' }}>
            {!loaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-3 pointer-events-none">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg,${active.color},${active.color}aa)` }}>
                  <Newspaper weight="fill" size={28} className="text-white"/>
                </div>
                <p className="text-sm text-muted">Loading live stream…</p>
              </div>
            )}
            <iframe
              key={`news-${active.id}-${reloadKey}-${useHls}`}
              src={embedSrc}
              title={active.name}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              onLoad={() => setLoaded(true)}/>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setLoaded(false); setReloadKey(k => k+1) }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all"
              style={{ background:'rgba(19,17,28,0.8)', border:'1px solid rgba(45,38,69,0.6)' }}>
              <ArrowClockwise weight="bold" size={13}/> Reload
            </button>
            {active.hls_url && (
              <button onClick={() => { setUseHls(!useHls); setLoaded(false); setReloadKey(k => k+1) }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: useHls ? 'rgba(124,58,237,0.2)' : 'rgba(19,17,28,0.8)',
                  border: `1px solid ${useHls ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.6)'}`,
                  color: useHls ? '#A78BFA' : '#7C7A91',
                }}>
                {useHls ? '▶ Using HLS' : '▶ Try HLS Stream'}
              </button>
            )}
          </div>

          <p className="text-sm text-muted mt-4">{active.description}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-mesh min-h-screen pb-24">
      <div className="relative overflow-hidden border-b border-border/40"
        style={{ background: 'linear-gradient(180deg,rgba(220,38,38,0.1) 0%,transparent 100%)' }}>
        <div className="max-w-7xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center gap-4 mb-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-sm"
              style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
              <Newspaper weight="fill" size={26} className="text-white"/>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Uganda News Live</h1>
              <p className="text-muted text-sm">NTV · NBS · BBS · Bukedde · Spark · Galaxy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {NEWS_CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => { setActive(ch); setLoaded(false) }}
              className="group relative overflow-hidden rounded-2xl text-left transition-all hover:-translate-y-1"
              style={{ background:'rgba(19,17,28,0.8)', border:'1px solid rgba(45,38,69,0.6)', boxShadow:'0 4px 16px rgba(0,0,0,0.4)' }}>
              {/* YouTube thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-surface-2">
                <img
                  src={`https://i.ytimg.com/vi_webp/undefined/mqdefault.webp`}
                  alt={ch.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => {
                    const el = e.currentTarget as HTMLImageElement
                    el.src = `https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=600&auto=format&fit=crop&q=60`
                  }}/>
                <div className="absolute inset-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  style={{ background:`linear-gradient(135deg,${ch.color}40,rgba(0,0,0,0.5))`, opacity:0.7 }}>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-glow-sm"
                    style={{ background:`linear-gradient(135deg,${ch.color},${ch.color}cc)` }}>
                    <Play weight="fill" size={18} className="text-white translate-x-0.5"/>
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
                  <span className="w-1 h-1 bg-white rounded-full live-dot"/> LIVE
                </div>
                {/* Logo */}
                <div className="absolute bottom-2 left-2">
                  <img src={ch.logo} alt={ch.name}
                    className="h-8 object-contain"
                    onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')}/>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-black text-white">{ch.name}</p>
                <p className="text-[10px] text-muted mt-0.5 line-clamp-1">{ch.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

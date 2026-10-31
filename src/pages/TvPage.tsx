import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Television, Play, MagnifyingGlass, X } from '@phosphor-icons/react'
import channelsData from '../data/tv_channels.json'
import type { TvChannel } from '../data/types'

const allChannels = (channelsData as TvChannel[]).filter(c => c.active)

const COUNTRY_TABS = ['All', 'Uganda', 'Kenya', 'International', 'UK', 'USA']

export default function TvPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('All')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allChannels.filter(c => {
      const matchSearch = !q || c.title.toLowerCase().includes(q) || (c.country ?? '').toLowerCase().includes(q)
      const matchCountry =
        country === 'All' ? true :
        country === 'International' ? (c.country === 'International' || c.country === null) :
        c.country === country
      return matchSearch && matchCountry
    })
  }, [search, country])

  // Group by country for display
  const ugandaChannels = allChannels.filter(c => c.country === 'Uganda' && c.poster_url)
  const kenyaChannels  = allChannels.filter(c => c.country === 'Kenya' && c.poster_url)
  const intlChannels   = allChannels.filter(c => !c.country && c.poster_url).slice(0, 20)

  const isFiltering = search || country !== 'All'

  return (
    <div className="pb-6 min-h-screen bg-mesh">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.15) 0%, transparent 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full blur-[60px] opacity-20"
            style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-sm"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>
              <Television weight="fill" size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {allChannels.length}<span className="text-primary-light">+</span>
              </h1>
              <p className="text-sm text-muted font-medium">Channels — Local &amp; International</p>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {COUNTRY_TABS.map(tab => (
              <button key={tab} onClick={() => setCountry(tab)}
                className="shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all"
                style={{
                  background: country === tab ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'rgba(45,38,69,0.5)',
                  border: `1px solid ${country === tab ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.8)'}`,
                  color: country === tab ? '#fff' : '#7C7A91',
                  boxShadow: country === tab ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                }}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 space-y-8">

        {/* ── Search ── */}
        <div className="relative">
          <MagnifyingGlass weight="bold" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input type="text" placeholder="Search channels…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-muted focus:outline-none transition-all"
            style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors">
              <X weight="bold" size={14} />
            </button>
          )}
        </div>

        {isFiltering ? (
          /* ── Filtered grid ── */
          <div>
            <p className="text-xs text-muted mb-4"><span className="text-white font-bold">{filtered.length}</span> channels found</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filtered.map(ch => <ChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/tv/watch/${ch.id}`)} />)}
            </div>
          </div>
        ) : (
          /* ── Grouped sections ── */
          <>
            <ChannelRow title="🇺🇬 Uganda" count={ugandaChannels.length}
              channels={ugandaChannels.slice(0,12)} onSeeAll={() => setCountry('Uganda')}
              onPlay={id => navigate(`/tv/watch/${id}`)} />
            {kenyaChannels.length > 0 && (
              <ChannelRow title="🇰🇪 Kenya" count={kenyaChannels.length}
                channels={kenyaChannels.slice(0,8)} onSeeAll={() => setCountry('Kenya')}
                onPlay={id => navigate(`/tv/watch/${id}`)} />
            )}
            <ChannelRow title="🌍 International" count={intlChannels.length}
              channels={intlChannels.slice(0,12)} onSeeAll={() => setCountry('International')}
              onPlay={id => navigate(`/tv/watch/${id}`)} />

            {/* Full grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-white">All Channels</h2>
                <span className="text-xs text-muted">{allChannels.length} total</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {allChannels.map(ch => <ChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/tv/watch/${ch.id}`)} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ChannelRow({ title, count, channels, onSeeAll, onPlay }: {
  title: string; count: number; channels: TvChannel[]
  onSeeAll: () => void; onPlay: (id: string) => void
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-white">{title}
          <span className="ml-2 text-sm font-semibold text-muted">({count})</span>
        </h2>
        <button onClick={onSeeAll} className="text-xs font-semibold text-primary-light hover:text-white transition-colors">See all →</button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {channels.map(ch => <ChannelCard key={ch.id} channel={ch} onClick={() => onPlay(ch.id)} />)}
      </div>
    </section>
  )
}

function ChannelCard({ channel, onClick }: { channel: TvChannel; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface hover:border-primary/40 transition-all hover:-translate-y-0.5 channel-glow text-left">
      <div className="aspect-video relative overflow-hidden">
        {channel.poster_url ? (
          <img src={channel.poster_url} alt={channel.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-2">
            <Television weight="duotone" size={22} className="text-primary-light opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary shadow-glow-sm flex items-center justify-center">
            <Play weight="fill" size={12} className="text-white translate-x-0.5" />
          </div>
        </div>
        <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
          <span className="w-1 h-1 bg-white rounded-full live-dot" /> LIVE
        </div>
      </div>
      <div className="p-2">
        <p className="text-[10px] font-bold text-white truncate">{channel.title}</p>
        {channel.country && <p className="text-[9px] text-muted mt-0.5 truncate">{channel.country}</p>}
      </div>
    </button>
  )
}

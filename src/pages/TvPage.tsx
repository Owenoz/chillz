import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Television, Play, MagnifyingGlass, X,
  Broadcast, Globe, Lightning,
} from '@phosphor-icons/react'
import channelsData from '../data/tv_channels.json'
import type { TvChannel } from '../data/types'

const allChannels = (channelsData as TvChannel[]).filter((c) => c.active)

// Derive unique countries (non-null)
const COUNTRIES = ['All', ...Array.from(
  new Set(allChannels.map((c) => c.country).filter(Boolean) as string[])
).sort()]

const TYPE_FILTERS = [
  { key: 'All',     label: 'All' },
  { key: 'HLS',     label: '⚡ HLS' },
  { key: 'YouTube', label: '▶ YouTube' },
  { key: 'Embed',   label: '⬡ Embed' },
]

// Featured channels (first 8 with posters)
const FEATURED = allChannels
  .filter((c) => !!c.poster_url)
  .slice(0, 8)

export default function TvPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('All')
  const [type, setType] = useState('All')

  const filtered = useMemo(() => {
    return allChannels.filter((c) => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        c.title.toLowerCase().includes(q) ||
        (c.country ?? '').toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q)
      const matchCountry = country === 'All' || c.country === country
      const matchType =
        type === 'All' ||
        (type === 'HLS' && c.source_type === 'hls') ||
        (type === 'Embed' && c.source_type === 'iframe') ||
        (type === 'YouTube' && c.source_type === 'youtube')
      return matchSearch && matchCountry && matchType
    })
  }, [search, country, type])

  const isFiltering = search || country !== 'All' || type !== 'All'

  return (
    <div className="pb-24 md:pb-8">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden border-b border-border/40"
        style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(10,14,26,1) 60%)',
        }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-48 rounded-full blur-[80px] opacity-10"
            style={{ background: 'radial-gradient(ellipse, #6c63ff, transparent)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] text-red-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" /> Live Now
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                Live TV
              </h1>
              <p className="text-gray-500 text-sm">
                <span className="text-white font-semibold">{allChannels.length}</span> channels — sports, news, entertainment
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-2xl font-black text-white">{allChannels.filter(c => c.source_type === 'hls').length}</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">HLS</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-right">
                <p className="text-2xl font-black text-white">{allChannels.filter(c => c.country).length}</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">Countries</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Featured row (only when not filtering) ── */}
        {!isFiltering && FEATURED.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lightning weight="duotone" size={15} className="text-primary-light" />
              <h2 className="text-sm font-bold text-white">Featured Channels</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {FEATURED.map((ch) => (
                <div key={ch.id} className="shrink-0 w-48">
                  <FeaturedCard channel={ch} onClick={() => navigate(`/tv/watch/${ch.id}`)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlass weight="bold" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search channels, countries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                <X weight="bold" size={13} />
              </button>
            )}
          </div>
          {/* Country */}
          <div className="relative">
            <Globe weight="duotone" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-surface border border-border rounded-xl pl-8 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60 appearance-none cursor-pointer min-w-[140px]"
            >
              {COUNTRIES.slice(0, 25).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {/* Type pills */}
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1">
            {TYPE_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setType(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  type === key
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">
            {isFiltering
              ? <><span className="text-white font-semibold">{filtered.length}</span> results</>
              : <><span className="text-white font-semibold">{filtered.length}</span> channels</>
            }
          </p>
          {isFiltering && (
            <button
              onClick={() => { setSearch(''); setCountry('All'); setType('All') }}
              className="text-xs text-gray-600 hover:text-white flex items-center gap-1 transition-colors"
            >
              <X weight="bold" size={11} /> Clear filters
            </button>
          )}
        </div>

        {/* ── Channel Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Television weight="duotone" size={40} className="text-gray-700 mx-auto" />
            <p className="text-gray-600 font-medium">No channels match your search</p>
            <button onClick={() => { setSearch(''); setCountry('All'); setType('All') }} className="text-primary-light text-sm hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/tv/watch/${ch.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────── */

function FeaturedCard({ channel, onClick }: { channel: TvChannel; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/6 bg-surface cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/30"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
    >
      <div className="aspect-video bg-surface-2 relative overflow-hidden">
        <img
          src={channel.poster_url!}
          alt={channel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* LIVE badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-widest">
          <span className="w-1 h-1 rounded-full bg-white live-dot" /> LIVE
        </div>
        {/* Play on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Play weight="fill" size={16} className="text-white" />
          </div>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs font-bold text-white truncate tracking-tight">{channel.title}</p>
        {channel.country && <p className="text-[10px] text-gray-600 mt-0.5">{channel.country}</p>}
      </div>
    </div>
  )
}

function ChannelCard({ channel, onClick }: { channel: TvChannel; onClick: () => void }) {
  const typeColor = channel.source_type === 'hls'
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : channel.source_type === 'youtube'
    ? 'text-red-400 bg-red-500/10 border-red-500/20'
    : 'text-blue-400 bg-blue-500/10 border-blue-500/20'

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-white/6 bg-surface cursor-pointer transition-all hover:-translate-y-0.5 hover:border-white/14"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
    >
      <div className="aspect-video bg-surface-2 relative overflow-hidden">
        {channel.poster_url ? (
          <img
            src={channel.poster_url}
            alt={channel.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-2">
            <Television weight="duotone" size={24} className="text-gray-700" />
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
            <Play weight="fill" size={10} /> Watch
          </div>
        </div>
        {/* LIVE */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-red-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-red-500/20 tracking-widest">
          <span className="w-1 h-1 rounded-full bg-red-500 live-dot" /> LIVE
        </div>
        {/* Source type */}
        <div className={`absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded border ${typeColor} tracking-widest`}>
          {channel.source_type === 'hls' ? 'HLS' : channel.source_type === 'youtube' ? 'YT' : 'EMB'}
        </div>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-[11px] font-semibold text-white truncate leading-tight tracking-tight">{channel.title}</p>
        <p className="text-[10px] text-gray-700 mt-0.5 flex items-center gap-1">
          {channel.country && (
            <span className="flex items-center gap-0.5">
              <Broadcast weight="duotone" size={9} className="text-gray-700" />
              {channel.country}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Television, Play } from '@phosphor-icons/react'
import channelsData from '../data/tv_channels.json'
import type { TvChannel } from '../data/types'

const channels = (channelsData as TvChannel[]).filter((c) => c.active)

const COUNTRIES = ['All', ...Array.from(new Set(channels.map((c) => c.country || 'Other'))).sort()]
const TYPES = ['All', 'HLS', 'Embed', 'YouTube']

export default function TvPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('All')
  const [type, setType] = useState('All')

  const filtered = useMemo(() => {
    return channels.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
      const matchCountry = country === 'All' || (c.country || 'Other') === country
      const matchType =
        type === 'All' ||
        (type === 'HLS' && c.source_type === 'hls') ||
        (type === 'Embed' && c.source_type === 'iframe') ||
        (type === 'YouTube' && c.source_type === 'youtube')
      return matchSearch && matchCountry && matchType
    })
  }, [search, country, type])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2"><Television weight="duotone" size={18} className="text-primary-light" /> Live TV</h1>
        <p className="text-gray-500 text-sm">{channels.length} channels streaming live</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/60"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60"
        >
          {COUNTRIES.slice(0, 20).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                type === t
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-600 mb-4">{filtered.length} channels</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No channels match your search.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/tv/watch/${ch.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChannelCard({ channel, onClick }: { channel: TvChannel; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="channel-card bg-surface border border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 group"
    >
      <div className="aspect-video bg-surface-2 relative overflow-hidden">
        {channel.poster_url ? (
          <img
            src={channel.poster_url}
            alt={channel.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-2 to-bg">
            <Television weight="duotone" size={30} className="text-gray-700" />
          </div>
        )}
        {/* LIVE badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          <span className="w-1.5 h-1.5 bg-white rounded-full live-dot" />
          LIVE
        </div>
        {/* Type badge */}
        <div className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-gray-300 uppercase">
          {channel.source_type === 'hls' ? 'HLS' : channel.source_type === 'youtube' ? 'YT' : 'EMBED'}
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Play weight="fill" size={16} className="text-white" />
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-white truncate leading-tight">{channel.title}</p>
        <div className="flex items-center justify-between mt-1">
          {channel.country ? (
            <p className="text-[10px] text-gray-600">{channel.country}</p>
          ) : (
            <span />
          )}
          <p className="text-[10px] text-gray-700">#{channel.display_order}</p>
        </div>
      </div>
    </div>
  )
}

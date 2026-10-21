import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlass, X, Funnel, SpinnerGap,
  Microphone, Play, Translate,
} from '@phosphor-icons/react'

export interface VJMovie {
  id: string
  t: string   // title
  v: string   // vj
  p: string   // poster_url
  y: number   // year
  u: string   // page_url
}

const VJ_COLORS: Record<string, string> = {
  'VJ Junior':    '#8B5CF6',
  'VJ Ice P':     '#3B82F6',
  'VJ Emmy':      '#10B981',
  'VJ Jingo':     '#EF4444',
  'VJ Muba':      '#F59E0B',
  'VJ Soul':      '#06B6D4',
  'VJ Ulio':      '#EC4899',
  'VJ Kevo':      '#6366F1',
  'VJ Ham':       '#84CC16',
  'VJ Neil':      '#F97316',
  'VJ Jovan':     '#A78BFA',
  'VJ Mark':      '#2DD4BF',
  'VJ Shield':    '#FB7185',
  'VJ Kevin':     '#FCD34D',
  'VJ Uncle T':   '#C084FC',
  'VJ Musa':      '#67E8F9',
  'VJ Tonny':     '#86EFAC',
  'VJ Mosco':     '#FCA5A5',
  'VJ Baros':     '#93C5FD',
  'VJ Kamil':     '#FDE68A',
  'Unknown VJ':   '#6B7280',
}

const PAGE_SIZE = 40

export default function TranslatedMoviesPage() {
  const navigate = useNavigate()
  const [allMovies, setAllMovies] = useState<VJMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedVj, setSelectedVj] = useState('All')
  const [page, setPage] = useState(1)
  const loaderRef = useRef<HTMLDivElement>(null)

  // Load dataset once
  useEffect(() => {
    fetch('/vj-movies.json')
      .then(r => r.json())
      .then((data: VJMovie[]) => {
        setAllMovies(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Derive VJ list from data
  const vjList = useMemo(() => {
    const counts: Record<string, number> = {}
    allMovies.forEach(m => { counts[m.v] = (counts[m.v] || 0) + 1 })
    return Object.entries(counts)
      .filter(([vj]) => vj !== 'Unknown VJ')
      .sort((a, b) => b[1] - a[1])
      .map(([vj, count]) => ({ vj, count }))
  }, [allMovies])

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allMovies.filter(m => {
      if (m.v === 'Unknown VJ' && !search && selectedVj === 'All') return false
      const matchVj = selectedVj === 'All' || m.v === selectedVj
      const matchSearch = !q || m.t.toLowerCase().includes(q) || m.v.toLowerCase().includes(q)
      return matchVj && matchSearch
    })
  }, [allMovies, search, selectedVj])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [search, selectedVj])

  // Infinite scroll via IntersectionObserver
  const loadMore = useCallback(() => {
    if (page * PAGE_SIZE < filtered.length) setPage(p => p + 1)
  }, [page, filtered.length])

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    }, { rootMargin: '300px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  const visible = filtered.slice(0, page * PAGE_SIZE)

  // Hero: first movie with a poster from selected VJ
  const hero = useMemo(() => {
    return filtered.find(m => m.p) || filtered[0]
  }, [filtered])

  const clearFilters = () => { setSearch(''); setSelectedVj('All') }
  const isFiltering = search || selectedVj !== 'All'

  return (
    <div className="pb-24 md:pb-8 min-h-screen">

      {/* ── Cinematic Hero ── */}
      {!loading && hero && (
        <div
          className="relative w-full overflow-hidden cursor-pointer group"
          style={{ aspectRatio: '21/9', minHeight: 200, maxHeight: 460 }}
          onClick={() => navigate(`/translated/${hero.id}`)}
        >
          {hero.p ? (
            <img
              src={hero.p}
              alt={hero.t}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${VJ_COLORS[hero.v] || '#6c63ff'}30, #0a0e1a)` }} />
          )}
          {/* Gradient overlays */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.5) 55%, rgba(10,14,26,0.1) 100%)'
          }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(10,14,26,1) 0%, rgba(10,14,26,0.3) 40%, transparent 70%)'
          }} />

          <div className="absolute inset-0 flex items-end px-5 pb-7 md:px-10 md:pb-10">
            <div className="max-w-lg">
              {/* VJ badge */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] uppercase px-2.5 py-1 rounded-full"
                  style={{
                    background: `${VJ_COLORS[hero.v] || '#8B5CF6'}25`,
                    border: `1px solid ${VJ_COLORS[hero.v] || '#8B5CF6'}50`,
                    color: VJ_COLORS[hero.v] || '#a78bfa',
                  }}
                >
                  <Microphone weight="duotone" size={10} />
                  {hero.v}
                </span>
                {hero.y > 0 && <span className="text-[10px] text-gray-500 font-medium">{hero.y}</span>}
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-4">
                {hero.t}
              </h2>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${VJ_COLORS[hero.v] || '#6c63ff'}, ${VJ_COLORS[hero.v] || '#4f46e5'}cc)`,
                  boxShadow: `0 8px 24px ${VJ_COLORS[hero.v] || '#6c63ff'}40`,
                }}
              >
                <Play weight="fill" size={14} /> Watch Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
              <Translate weight="duotone" size={22} className="text-primary-light" />
              VJ Movies
            </h1>
            <p className="text-gray-600 text-sm mt-0.5">
              {loading ? 'Loading…' : `${filtered.length.toLocaleString()} movies in Luganda`}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-right">
            <div>
              <p className="text-xl font-black text-white">{allMovies.length.toLocaleString()}</p>
              <p className="text-[10px] text-gray-700 uppercase tracking-wider">Total</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-xl font-black text-white">{vjList.length}</p>
              <p className="text-[10px] text-gray-700 uppercase tracking-wider">VJs</p>
            </div>
          </div>
        </div>

        {/* ── VJ pill selector ── */}
        {!loading && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedVj('All')}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: selectedVj === 'All' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selectedVj === 'All' ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: selectedVj === 'All' ? '#a78bfa' : '#9ca3af',
              }}
            >
              All VJs
            </button>
            {vjList.slice(0, 16).map(({ vj, count }) => {
              const color = VJ_COLORS[vj] || '#8B5CF6'
              const active = selectedVj === vj
              return (
                <button
                  key={vj}
                  onClick={() => setSelectedVj(active ? 'All' : vj)}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: active ? `${color}25` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? color + '55' : 'rgba(255,255,255,0.08)'}`,
                    color: active ? color : '#9ca3af',
                  }}
                >
                  <Microphone weight={active ? 'fill' : 'regular'} size={10} style={{ color }} />
                  {vj}
                  <span style={{ color: active ? color : '#4b5563', opacity: 0.7 }} className="text-[9px] font-semibold">{count}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Search + filter row ── */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass weight="bold" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search movies or VJ…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                <X weight="bold" size={13} />
              </button>
            )}
          </div>
          {isFiltering && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-surface border border-border hover:border-white/20 text-gray-500 hover:text-white text-sm font-medium rounded-xl transition-all"
            >
              <X weight="bold" size={12} /> Clear
            </button>
          )}
        </div>

        {/* ── Results count ── */}
        {!loading && (
          <p className="text-xs text-gray-700">
            Showing <span className="text-white font-semibold">{Math.min(visible.length, filtered.length).toLocaleString()}</span> of <span className="text-white font-semibold">{filtered.length.toLocaleString()}</span>
            {selectedVj !== 'All' && <span className="ml-1" style={{ color: VJ_COLORS[selectedVj] }}>· {selectedVj}</span>}
          </p>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-xl bg-surface-2 mb-2" />
                <div className="h-3 bg-surface-2 rounded w-3/4 mb-1" />
                <div className="h-2.5 bg-surface-2 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* ── Movie Grid ── */}
        {!loading && visible.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {visible.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => navigate(`/translated/${movie.id}`)}
              />
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && visible.length === 0 && (
          <div className="text-center py-24 space-y-3">
            <Funnel weight="duotone" size={40} className="text-gray-700 mx-auto" />
            <p className="text-gray-500 font-medium">No movies found</p>
            <button onClick={clearFilters} className="text-primary-light text-sm hover:underline">Clear filters</button>
          </div>
        )}

        {/* ── Infinite scroll trigger ── */}
        <div ref={loaderRef} className="flex justify-center py-4">
          {!loading && page * PAGE_SIZE < filtered.length && (
            <SpinnerGap weight="bold" size={20} className="text-gray-700 animate-spin" />
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Movie Card ──────────────────────────────────────────── */
function MovieCard({ movie, onClick }: { movie: VJMovie; onClick: () => void }) {
  const color = VJ_COLORS[movie.v] || '#8B5CF6'
  const [imgError, setImgError] = useState(false)

  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2"
        style={{ background: `linear-gradient(135deg, ${color}20, #0d0b1a)` }}>

        {movie.p && !imgError ? (
          <img
            src={movie.p}
            alt={movie.t}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Microphone weight="duotone" size={28} style={{ color, opacity: 0.4 }} />
          </div>
        )}

        {/* Dark gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            className="flex items-center gap-1.5 text-[11px] font-bold text-white px-3 py-1.5 rounded-full"
            style={{ background: color, boxShadow: `0 4px 12px ${color}60` }}
          >
            <Play weight="fill" size={9} /> Play
          </div>
        </div>

        {/* VJ badge */}
        <div
          className="absolute top-1.5 left-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-md tracking-wider leading-none"
          style={{ background: `${color}30`, border: `1px solid ${color}50`, color }}
        >
          {movie.v.replace('VJ ', '')}
        </div>
      </div>

      <p className="text-[11px] font-semibold text-white truncate tracking-tight leading-tight">{movie.t}</p>
      {movie.y > 0 && <p className="text-[9px] text-gray-700 mt-0.5">{movie.y}</p>}
    </div>
  )
}

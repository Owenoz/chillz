import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilmSlate, Play, MagnifyingGlass, X, ArrowRight } from '@phosphor-icons/react'
import { fetchIARail, searchIA, genres as getGenres, IA_RAILS, type IAMovie } from '../lib/archiveApi'

const CATEGORIES = ['All', 'Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Classic', 'Documentary']

const RAIL_COLORS: Record<string, string> = {
  popular: '#F59E0B', action: '#EF4444', drama: '#6366F1',
  comedy: '#10B981', thriller: '#8B5CF6', scifi: '#38BDF8',
  classic: '#F97316', western: '#A16207', romance: '#EC4899', documentary: '#64748B',
}

type RailsState = Record<string, IAMovie[]>

function moviePath(m: IAMovie) {
  return `/movies/watch/${encodeURIComponent(m.identifier)}?title=${encodeURIComponent(m.title)}&year=${m.year}`
}

export default function MoviesPage() {
  const navigate = useNavigate()
  const [rails, setRails]               = useState<RailsState>({})
  const [loading, setLoading]           = useState(true)
  const [apiError, setApiError]         = useState(false)
  const [search, setSearch]             = useState('')
  const [searchResults, setSearchResults] = useState<IAMovie[]>([])
  const [searching, setSearching]       = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  const loadRails = useCallback(async () => {
    setLoading(true); setApiError(false)
    try {
      const first = await fetchIARail(IA_RAILS[0].query)
      if (!first.length) { setApiError(true); setLoading(false); return }
      setRails({ [IA_RAILS[0].key]: first })
      setLoading(false)
      const rest = await Promise.all(IA_RAILS.slice(1).map(r => fetchIARail(r.query)))
      setRails(prev => {
        const u = { ...prev }
        IA_RAILS.slice(1).forEach((r, i) => { u[r.key] = rest[i] })
        return u
      })
    } catch { setApiError(true); setLoading(false) }
  }, [])

  useEffect(() => { loadRails() }, [loadRails])

  useEffect(() => {
    clearTimeout(searchTimer.current)
    if (!search.trim()) { setSearchResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      const r = await searchIA(search.trim())
      setSearchResults(r); setSearching(false)
    }, 450)
    return () => clearTimeout(searchTimer.current)
  }, [search])

  const hero = rails[IA_RAILS[0].key]?.[0]

  const visibleRails = IA_RAILS.filter(r =>
    activeCategory === 'All' ? true : r.label.toLowerCase().includes(activeCategory.toLowerCase())
  )

  return (
    <div className="bg-mesh min-h-screen pb-6">

      {/* ── Cinematic Hero ── */}
      {!search && hero && (
        <div className="relative overflow-hidden cursor-pointer group"
          style={{ aspectRatio: '21/9', minHeight: 220, maxHeight: 480 }}
          onClick={() => navigate(moviePath(hero))}>
          <img src={hero.thumb} alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(10,10,15,0.96) 0%, rgba(10,10,15,0.6) 55%, rgba(10,10,15,0.15) 100%)'
          }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0A0A0F 0%, transparent 55%)' }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 50% 80% at 20% 50%, rgba(124,58,237,0.15), transparent 70%)'
          }} />

          <div className="absolute inset-0 flex items-end px-6 pb-8 md:px-10 md:pb-10">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary-light bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-full">
                  Free · No Signup
                </span>
                {hero.year ? <span className="text-[10px] text-muted font-medium">{hero.year}</span> : null}
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-3">{hero.title}</h2>
              {hero.description && (
                <p className="text-sm text-muted line-clamp-2 hidden sm:block mb-4 max-w-md">
                  {hero.description.slice(0, 150)}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
                  <Play weight="fill" size={14} /> Play Now
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/20 bg-white/8 hover:bg-white/12 transition-all backdrop-blur-sm">
                  + Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-5 space-y-8 pt-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FilmSlate weight="duotone" size={22} className="text-accent" /> Movies
            </h1>
            <p className="text-muted text-sm mt-0.5">28,000+ free public domain classics</p>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <MagnifyingGlass weight="bold" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input type="text" placeholder="Search movies, genres, directors…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-muted focus:outline-none transition-all"
            style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors">
              <X weight="bold" size={14} />
            </button>
          )}
        </div>

        {/* ── Category tabs ── */}
        {!search && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all"
                style={{
                  background: activeCategory === cat ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'rgba(19,17,28,0.7)',
                  border: `1px solid ${activeCategory === cat ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.6)'}`,
                  color: activeCategory === cat ? '#fff' : '#7C7A91',
                  boxShadow: activeCategory === cat ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Movie Categories tiles ── */}
        {!search && !loading && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white">Movie Categories</h2>
              <button className="text-xs font-semibold text-primary-light hover:text-white flex items-center gap-1">See all <ArrowRight size={11} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Action', color: '#EF4444', img: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&auto=format&fit=crop&q=80' },
                { label: 'Comedy', color: '#10B981', img: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=300&auto=format&fit=crop&q=80' },
                { label: 'Drama',  color: '#6366F1', img: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&auto=format&fit=crop&q=80' },
              ].map(c => (
                <button key={c.label} onClick={() => setActiveCategory(c.label)}
                  className="relative overflow-hidden rounded-2xl group" style={{ aspectRatio: '16/9' }}>
                  <img src={c.img} alt={c.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${c.color}99, transparent)` }} />
                  <span className="absolute bottom-2 left-0 right-0 text-center text-sm font-black text-white">{c.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Error ── */}
        {apiError && !search && (
          <div className="rounded-2xl p-10 text-center space-y-3 border border-border bg-surface">
            <FilmSlate weight="duotone" size={40} className="text-muted mx-auto opacity-40" />
            <p className="font-bold text-white">Movie library unavailable</p>
            <p className="text-sm text-muted">Could not reach Internet Archive. Check your connection.</p>
            <button onClick={loadRails} className="btn-primary px-5 py-2 rounded-xl text-sm font-bold text-white">↺ Retry</button>
          </div>
        )}

        {/* ── Search Results ── */}
        {search.trim() && (
          <div>
            <h2 className="text-sm font-bold text-muted mb-5">
              {searching ? 'Searching…' : searchResults.length > 0
                ? `${searchResults.length} results for "${search}"`
                : `No results for "${search}"`}
            </h2>
            {searching ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} />)}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {searchResults.map(m => <MovieCard key={m.identifier} movie={m} onClick={() => navigate(moviePath(m))} />)}
              </div>
            ) : <p className="text-muted text-sm">Try different keywords.</p>}
          </div>
        )}

        {/* ── Popular Movies header ── */}
        {!search && !loading && !apiError && (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Popular Movies</h2>
            <button className="text-xs font-semibold text-primary-light hover:text-white flex items-center gap-1">See all <ArrowRight size={11} /></button>
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading && !search && (
          <div className="space-y-8">
            {[1,2].map(i => (
              <div key={i}>
                <div className="h-5 w-36 rounded-xl skeleton mb-4" />
                <div className="flex gap-3">
                  {Array.from({length:6}).map((_,j) => <div key={j} className="shrink-0 w-32 aspect-[2/3] rounded-2xl skeleton" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Rails ── */}
        {!search && !apiError && !loading && visibleRails.map(({ key, label }) => {
          const movies = rails[key]
          if (!movies?.length) return null
          const color = RAIL_COLORS[key] || '#7C3AED'
          return (
            <section key={key}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-black text-white flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full" style={{ background: color }} />
                  {label}
                </h2>
                <button className="text-xs font-semibold text-primary-light hover:text-white flex items-center gap-1">See all <ArrowRight size={11} /></button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {movies.map(m => (
                  <div key={m.identifier} className="shrink-0 w-[120px] sm:w-[140px]">
                    <MovieCard movie={m} onClick={() => navigate(moviePath(m))} />
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function MovieCard({ movie, onClick }: { movie: IAMovie; onClick: () => void }) {
  const [err, setErr] = useState(false)
  const gs = getGenres(movie)
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2"
        style={{ background: 'rgba(19,17,28,0.8)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
        {movie.thumb && !err ? (
          <img src={movie.thumb} alt={movie.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FilmSlate weight="duotone" size={28} className="text-muted opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-3">
          <div className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-glow-sm">
            <Play weight="fill" size={10} /> Watch
          </div>
        </div>
        {movie.year ? (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg">{movie.year}</div>
        ) : null}
        {gs[0] && (
          <div className="absolute top-2 left-2 bg-primary/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide">
            {gs[0].slice(0, 8)}
          </div>
        )}
      </div>
      <p className="text-[12px] font-bold text-white truncate tracking-tight">{movie.title}</p>
      <p className="text-[10px] text-muted mt-0.5">{movie.year || 'Classic'}</p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-2xl skeleton mb-2" />
      <div className="h-3 skeleton rounded w-3/4 mb-1.5" />
      <div className="h-2.5 skeleton rounded w-1/2" />
    </div>
  )
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FilmSlate, Play, Star, MagnifyingGlass, X,
  Flame, Sparkle, TrendUp, ArrowRight, Clock,
} from '@phosphor-icons/react'
import {
  fetchIARail, searchIA,
  genres as getGenres, IA_RAILS,
  type IAMovie,
} from '../lib/archiveApi'

const RAIL_ICONS: Record<string, React.ReactNode> = {
  popular:     <Flame weight="duotone" size={15} />,
  action:      <Flame weight="duotone" size={15} />,
  drama:       <FilmSlate weight="duotone" size={15} />,
  comedy:      <Sparkle weight="duotone" size={15} />,
  thriller:    <TrendUp weight="duotone" size={15} />,
  scifi:       <Sparkle weight="duotone" size={15} />,
  classic:     <Clock weight="duotone" size={15} />,
  western:     <Flame weight="duotone" size={15} />,
  romance:     <Star weight="duotone" size={15} />,
  documentary: <FilmSlate weight="duotone" size={15} />,
}

const RAIL_COLORS: Record<string, string> = {
  popular: '#f97316', action: '#ef4444', drama: '#6366f1',
  comedy: '#10b981', thriller: '#8b5cf6', scifi: '#38bdf8',
  classic: '#fbbf24', western: '#a16207', romance: '#ec4899',
  documentary: '#64748b',
}

type RailsState = Record<string, IAMovie[]>

function moviePath(m: IAMovie) {
  return `/movies/watch/${encodeURIComponent(m.identifier)}?title=${encodeURIComponent(m.title)}&year=${m.year}`
}

export default function MoviesPage() {
  const navigate = useNavigate()
  const [rails, setRails] = useState<RailsState>({})
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<IAMovie[]>([])
  const [searching, setSearching] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  const loadRails = useCallback(async () => {
    setLoading(true)
    setApiError(false)
    try {
      // Load first rail fast
      const first = await fetchIARail(IA_RAILS[0].query)
      if (!first.length) { setApiError(true); setLoading(false); return }
      setRails({ [IA_RAILS[0].key]: first })
      setLoading(false)
      // Load rest in background
      const rest = await Promise.all(
        IA_RAILS.slice(1).map(r => fetchIARail(r.query))
      )
      setRails(prev => {
        const u = { ...prev }
        IA_RAILS.slice(1).forEach((r, i) => { u[r.key] = rest[i] })
        return u
      })
    } catch {
      setApiError(true)
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRails() }, [loadRails])

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current)
    if (!search.trim()) { setSearchResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      const results = await searchIA(search.trim())
      setSearchResults(results)
      setSearching(false)
    }, 450)
    return () => clearTimeout(searchTimer.current)
  }, [search])

  const hero = rails[IA_RAILS[0].key]?.[0]

  return (
    <div className="pb-24 md:pb-8">

      {/* ── Cinematic Hero ── */}
      {!search && hero && (
        <div
          className="relative w-full overflow-hidden cursor-pointer group"
          style={{ aspectRatio: '21/9', minHeight: 220, maxHeight: 500 }}
          onClick={() => navigate(moviePath(hero))}
        >
          <img
            src={hero.thumb}
            alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.55) 55%, rgba(10,14,26,0.1) 100%)'
          }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(10,14,26,1) 0%, rgba(10,14,26,0.3) 45%, transparent 70%)'
          }} />

          <div className="absolute inset-0 flex items-end px-6 pb-8 md:px-10 md:pb-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary-light bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-full">
                  Free · No Signup
                </span>
                {hero.year ? <span className="text-[10px] text-gray-500">{hero.year}</span> : null}
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-4">
                {hero.title}
              </h2>
              {hero.description && (
                <p className="text-sm text-gray-400 line-clamp-2 hidden sm:block mb-4 max-w-md">
                  {hero.description.slice(0, 160)}
                </p>
              )}
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', boxShadow: '0 8px 24px rgba(108,99,255,0.35)' }}
              >
                <Play weight="fill" size={14} /> Watch Free
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
              <FilmSlate weight="duotone" size={22} className="text-primary-light" />
              Free Movies
            </h1>
            <p className="text-gray-600 text-sm mt-0.5">Public domain classics — stream or download free, no account needed</p>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <MagnifyingGlass weight="bold" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search movies, directors, genres…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-1">
              <X weight="bold" size={14} />
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {apiError && !search && (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center space-y-3">
            <FilmSlate weight="duotone" size={40} className="text-gray-700 mx-auto" />
            <p className="font-semibold text-white">Movie library unavailable</p>
            <p className="text-sm text-gray-500">Could not reach Internet Archive. Check your connection.</p>
            <button onClick={loadRails} className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl">↺ Retry</button>
          </div>
        )}

        {/* ── Search results ── */}
        {search.trim() && (
          <div>
            <h2 className="text-sm font-bold text-gray-400 mb-5">
              {searching ? 'Searching…' : searchResults.length > 0
                ? `${searchResults.length} results for "${search}"`
                : `No results for "${search}"`}
            </h2>
            {searching ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {Array.from({ length: 16 }).map((_, i) => <Skeleton key={i} />)}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {searchResults.map(m => (
                  <MovieCard key={m.identifier} movie={m} onClick={() => navigate(moviePath(m))} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Try different keywords.</p>
            )}
          </div>
        )}

        {/* ── Browse Rails ── */}
        {!search && !apiError && (
          <>
            {loading && (
              <div className="space-y-10">
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-4 h-4 bg-surface-2 rounded animate-pulse" />
                      <div className="w-32 h-4 bg-surface-2 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-3 overflow-x-hidden">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <div key={j} className="shrink-0 w-32 aspect-[2/3] bg-surface-2 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && IA_RAILS.map(({ key, label }) => {
              const movies = rails[key]
              if (!movies?.length) return null
              const color = RAIL_COLORS[key] || '#8b5cf6'
              return (
                <section key={key}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-2 text-[15px] font-bold text-white tracking-tight">
                      <span style={{ color }}>{RAIL_ICONS[key]}</span>
                      {label}
                    </h2>
                    <button className="flex items-center gap-1 text-[12px] text-gray-600 hover:text-gray-300 transition-colors">
                      See all <ArrowRight size={11} />
                    </button>
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
          </>
        )}
      </div>
    </div>
  )
}

function MovieCard({ movie, onClick }: { movie: IAMovie; onClick: () => void }) {
  const [err, setErr] = useState(false)
  const gs = getGenres(movie)

  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-2 mb-2">
        {movie.thumb && !err ? (
          <img
            src={movie.thumb}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-2">
            <FilmSlate weight="duotone" size={28} className="text-gray-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-3">
          <div className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg">
            <Play weight="fill" size={10} /> Watch
          </div>
        </div>
        {movie.year ? (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-gray-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            {movie.year}
          </div>
        ) : null}
        {gs[0] && (
          <div className="absolute top-2 left-2 bg-primary/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md tracking-wide uppercase">
            {gs[0].slice(0, 8)}
          </div>
        )}
      </div>
      <p className="text-[12px] font-semibold text-white truncate tracking-tight">{movie.title}</p>
      <p className="text-[10px] text-gray-600 mt-0.5">{movie.year || 'Classic'}</p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-xl bg-surface-2 mb-2" />
      <div className="h-3 bg-surface-2 rounded w-3/4 mb-1.5" />
      <div className="h-2.5 bg-surface-2 rounded w-1/2" />
    </div>
  )
}

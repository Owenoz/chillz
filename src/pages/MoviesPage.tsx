import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilmSlate, Play, Star } from '@phosphor-icons/react'

interface Movie {
  id: number
  title: string
  year: number
  type: string
  poster: string
  backdrop: string
  user_rating: number
  plot_overview: string
  genre_names?: string[]
}

const TMDB_PROXY = 'https://ruljvifbvhpdaifkjxtj.supabase.co/functions/v1/tmdb-proxy'
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1bGp2aWZidmhwZGFpZmtqeHRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5OTI3NTAsImV4cCI6MjEwNTU2ODc1MH0.pfXfjixdQtLne3P1dzof_FVZP7YZn-5NLyRXQE2qAOU'

async function fetchRail(params: Record<string, string>): Promise<Movie[]> {
  try {
    const res = await fetch(TMDB_PROXY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ path: '/list-titles/', params }),
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data?.titles)) return []
    return data.titles.slice(0, 24).map((t: Record<string, unknown>) => ({
      id: t.id as number,
      title: (t.title ?? t.name ?? 'Unknown') as string,
      year: t.year as number,
      type: t.type as string,
      poster: t.poster as string,
      backdrop: t.backdrop as string,
      user_rating: t.user_rating as number,
      plot_overview: t.plot_overview as string,
      genre_names: t.genre_names as string[],
    }))
  } catch {
    return []
  }
}

// Search uses a different path
async function searchMovies(query: string): Promise<Movie[]> {
  try {
    const res = await fetch(TMDB_PROXY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ path: '/search/', params: { query, limit: '20' } }),
    })
    if (!res.ok) return []
    const data = await res.json()
    const arr = data?.results ?? data?.titles ?? data ?? []
    if (!Array.isArray(arr)) return []
    return arr.slice(0, 20).map((t: Record<string, unknown>) => ({
      id: t.id as number,
      title: (t.title ?? t.name ?? 'Unknown') as string,
      year: t.year as number,
      type: (t.type ?? 'movie') as string,
      poster: t.poster as string,
      backdrop: t.backdrop as string,
      user_rating: t.user_rating as number,
      plot_overview: t.plot_overview as string,
      genre_names: t.genre_names as string[],
    }))
  } catch {
    return []
  }
}

const RAILS_CONFIG: { key: string; label: string; params: Record<string, string> }[] = [
  { key: 'popular',     label: 'Popular Now',  params: { types: 'movie',     sort_by: 'popularity_desc',    limit: '24' } },
  { key: 'newReleases', label: 'New Releases',  params: { types: 'movie',     sort_by: 'release_date_desc',  limit: '24' } },
  { key: 'topRated',    label: 'Top Rated',      params: { types: 'movie',     sort_by: 'user_rating_desc',   limit: '24' } },
  { key: 'tvShows',     label: 'TV Shows',       params: { types: 'tv_series', sort_by: 'popularity_desc',    limit: '24' } },
  { key: 'action',      label: 'Action',         params: { types: 'movie',     genres: '1',  sort_by: 'popularity_desc', limit: '24' } },
  { key: 'drama',       label: 'Drama',           params: { types: 'movie',     genres: '9',  sort_by: 'popularity_desc', limit: '24' } },
  { key: 'horror',      label: 'Horror',          params: { types: 'movie',     genres: '11', sort_by: 'popularity_desc', limit: '24' } },
  { key: 'sciFi',       label: 'Sci-Fi',          params: { types: 'movie',     genres: '14', sort_by: 'popularity_desc', limit: '24' } },
]

type RailsState = Record<string, Movie[]>

function movieWatchUrl(m: Movie) {
  const t = m.type === 'tv_series' ? 'tv' : 'movie'
  const p = new URLSearchParams({
    type: t,
    title: m.title ?? '',
    year: String(m.year ?? ''),
    rating: m.user_rating ? m.user_rating.toFixed(1) : '',
    poster: m.poster ?? '',
    plot: m.plot_overview ?? '',
  })
  return `/movies/watch/${m.id}?${p.toString()}`
}

export default function MoviesPage() {
  const navigate = useNavigate()
  const [rails, setRails] = useState<RailsState>({})
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [searching, setSearching] = useState(false)

  const loadRails = useCallback(async () => {
    setLoading(true)
    setApiError(false)
    try {
      // Load popular first for fast first paint
      const popular = await fetchRail(RAILS_CONFIG[0].params)
      if (popular.length === 0) { setApiError(true); setLoading(false); return }
      setRails({ popular })
      setLoading(false)
      // Load the rest in background
      const rest = await Promise.all(RAILS_CONFIG.slice(1).map((r) => fetchRail(r.params)))
      setRails((prev) => {
        const updated = { ...prev }
        RAILS_CONFIG.slice(1).forEach((r, i) => { updated[r.key] = rest[i] })
        return updated
      })
    } catch {
      setApiError(true)
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRails() }, [loadRails])

  // Search with debounce
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      const results = await searchMovies(search.trim())
      setSearchResults(results)
      setSearching(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [search])

  const heroMovie = rails.popular?.[0]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight"><FilmSlate weight="duotone" size={22} className="text-primary-light" /> Movies & TV</h1>
        <p className="text-gray-500 text-sm mt-1">Stream free — no subscription needed</p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search movies & shows…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 pr-10"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── API Error ── */}
      {apiError && !search && (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center space-y-3">
          <FilmSlate weight="duotone" size={40} className="text-gray-700 mx-auto" />
          <p className="font-semibold text-white">Movie library unavailable right now</p>
          <p className="text-sm text-gray-500">The external movie provider is not responding. Try again later.</p>
          <button
            onClick={loadRails}
            className="px-5 py-2 bg-primary hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Search results ── */}
      {search.trim() && (
        <div>
          <h2 className="text-sm font-bold text-gray-400 mb-4">
            {searching ? 'Searching…' : searchResults.length > 0 ? `${searchResults.length} results for "${search}"` : `No results for "${search}"`}
          </h2>
          {searching ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => <PosterSkeleton key={i} />)}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {searchResults.map((m) => (
                <MovieCard key={m.id} movie={m} onClick={() => navigate(movieWatchUrl(m))} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">Try a different title.</p>
          )}
        </div>
      )}

      {/* ── Browse mode ── */}
      {!search.trim() && !apiError && (
        <>
          {/* Hero */}
          {heroMovie && (
            <div
              className="relative rounded-2xl overflow-hidden aspect-[21/9] cursor-pointer group"
              onClick={() => navigate(movieWatchUrl(heroMovie))}
            >
              {heroMovie.backdrop ? (
                <img
                  src={heroMovie.backdrop}
                  alt={heroMovie.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-surface to-bg" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 max-w-lg">
                <p className="text-xs text-primary-light font-semibold uppercase tracking-widest mb-2">Featured</p>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">{heroMovie.title}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  {heroMovie.year && <span>{heroMovie.year}</span>}
                  {heroMovie.user_rating > 0 && <span><Star weight="fill" size={11} className="text-amber-400" /> {heroMovie.user_rating.toFixed(1)}</span>}
                </div>
                {heroMovie.plot_overview && (
                  <p className="text-sm text-gray-300 line-clamp-2 hidden sm:block">{heroMovie.plot_overview}</p>
                )}
                <button className="mt-4 px-5 py-2.5 bg-primary hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-colors">
                  ▶ Watch Now
                </button>
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="w-36 h-4 bg-surface-2 rounded mb-4 animate-pulse" />
                  <div className="flex gap-3 overflow-x-hidden">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <div key={j} className="shrink-0 w-32 aspect-[2/3] bg-surface-2 rounded-xl animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rails */}
          {!loading && RAILS_CONFIG.map(({ key, label }) => {
            const movies = rails[key]
            if (!movies?.length) return null
            return (
              <section key={key}>
                <h2 className="text-lg font-bold text-white mb-4">{label}</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {movies.map((m) => (
                    <div key={m.id} className="shrink-0 w-32 sm:w-36">
                      <MovieCard movie={m} onClick={() => navigate(movieWatchUrl(m))} />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}

function MovieCard({ movie, onClick }: { movie: Movie; onClick: () => void }) {
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-2 mb-2">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-2"><FilmSlate weight="duotone" size={32} className="text-gray-700" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
          <span className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-full"><Play weight="fill" size={10} /> Watch</span>
        </div>
        {movie.user_rating > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><Star weight="fill" size={9} /> {movie.user_rating.toFixed(1)}</div>
        )}
      </div>
      <p className="text-xs font-semibold text-white truncate">{movie.title}</p>
      <p className="text-[10px] text-gray-600">{movie.year}</p>
    </div>
  )
}

function PosterSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-xl bg-surface-2 mb-2" />
      <div className="h-3 bg-surface-2 rounded w-3/4 mb-1" />
      <div className="h-2.5 bg-surface-2 rounded w-1/2" />
    </div>
  )
}

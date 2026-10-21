import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FilmSlate, Play, Star, MagnifyingGlass, X,
  Globe, Flame, TrendUp, Sparkle, ArrowRight,
} from '@phosphor-icons/react'

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

interface RailConfig {
  key: string
  label: string
  icon: React.ReactNode
  accent: string
  params: Record<string, string>
}

const RAILS_CONFIG: RailConfig[] = [
  {
    key: 'popular',
    label: 'Trending Now',
    icon: <Flame weight="duotone" size={16} />,
    accent: '#f97316',
    params: { types: 'movie', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'newReleases',
    label: 'New Releases',
    icon: <Sparkle weight="duotone" size={16} />,
    accent: '#a78bfa',
    params: { types: 'movie', sort_by: 'release_date_desc', limit: '24' },
  },
  {
    key: 'topRated',
    label: 'Top Rated',
    icon: <Star weight="duotone" size={16} />,
    accent: '#fbbf24',
    params: { types: 'movie', sort_by: 'user_rating_desc', limit: '24' },
  },
  {
    key: 'tvShows',
    label: 'TV Series',
    icon: <TrendUp weight="duotone" size={16} />,
    accent: '#34d399',
    params: { types: 'tv_series', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'action',
    label: 'Action & Adventure',
    icon: <Flame weight="duotone" size={16} />,
    accent: '#ef4444',
    params: { types: 'movie', genres: '1', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'drama',
    label: 'Drama',
    icon: <FilmSlate weight="duotone" size={16} />,
    accent: '#60a5fa',
    params: { types: 'movie', genres: '9', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'horror',
    label: 'Horror & Thriller',
    icon: <Flame weight="duotone" size={16} />,
    accent: '#dc2626',
    params: { types: 'movie', genres: '11', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'sciFi',
    label: 'Sci-Fi & Fantasy',
    icon: <Sparkle weight="duotone" size={16} />,
    accent: '#818cf8',
    params: { types: 'movie', genres: '14', sort_by: 'popularity_desc', limit: '24' },
  },
  // ── Translated / World Cinema ─────────────────────────────────────
  {
    key: 'arabic',
    label: 'Arabic Cinema',
    icon: <Globe weight="duotone" size={16} />,
    accent: '#f59e0b',
    params: { types: 'movie', languages: 'ar', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'french',
    label: 'French Cinema',
    icon: <Globe weight="duotone" size={16} />,
    accent: '#3b82f6',
    params: { types: 'movie', languages: 'fr', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'spanish',
    label: 'Spanish & Latino',
    icon: <Globe weight="duotone" size={16} />,
    accent: '#f97316',
    params: { types: 'movie', languages: 'es', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'korean',
    label: 'K-Drama & Korean Films',
    icon: <Globe weight="duotone" size={16} />,
    accent: '#ec4899',
    params: { types: 'movie', languages: 'ko', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'hindi',
    label: 'Bollywood & Hindi',
    icon: <Globe weight="duotone" size={16} />,
    accent: '#fb923c',
    params: { types: 'movie', languages: 'hi', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'turkish',
    label: 'Turkish Dramas',
    icon: <Globe weight="duotone" size={16} />,
    accent: '#e879f9',
    params: { types: 'tv_series', languages: 'tr', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'japanese',
    label: 'Japanese Anime & Film',
    icon: <Globe weight="duotone" size={16} />,
    accent: '#38bdf8',
    params: { types: 'movie', languages: 'ja', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'swahili',
    label: 'African & Swahili',
    icon: <Globe weight="duotone" size={16} />,
    accent: '#4ade80',
    params: { types: 'movie', languages: 'sw', sort_by: 'popularity_desc', limit: '24' },
  },
  {
    key: 'portuguese',
    label: 'Portuguese & Brazilian',
    icon: <Globe weight="duotone" size={16} />,
    accent: '#2dd4bf',
    params: { types: 'movie', languages: 'pt', sort_by: 'popularity_desc', limit: '24' },
  },
]

// Group rails for the UI
const WORLD_CINEMA_KEYS = ['arabic', 'french', 'spanish', 'korean', 'hindi', 'turkish', 'japanese', 'swahili', 'portuguese']

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
  const [activeTab, setActiveTab] = useState<'all' | 'world'>('all')
  const searchRef = useRef<HTMLInputElement>(null)

  const loadRails = useCallback(async () => {
    setLoading(true)
    setApiError(false)
    try {
      const popular = await fetchRail(RAILS_CONFIG[0].params)
      if (popular.length === 0) { setApiError(true); setLoading(false); return }
      setRails({ popular })
      setLoading(false)
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

  const visibleRails = RAILS_CONFIG.filter(r => {
    if (activeTab === 'world') return WORLD_CINEMA_KEYS.includes(r.key)
    return !WORLD_CINEMA_KEYS.includes(r.key)
  })

  return (
    <div className="pb-24 md:pb-8">

      {/* ── Cinematic Hero ── */}
      {!search.trim() && heroMovie && (
        <div
          className="relative w-full overflow-hidden cursor-pointer group"
          style={{ aspectRatio: '21/9', minHeight: 220, maxHeight: 520 }}
          onClick={() => navigate(movieWatchUrl(heroMovie))}
        >
          {heroMovie.backdrop ? (
            <img
              src={heroMovie.backdrop}
              alt={heroMovie.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950 to-bg" />
          )}
          {/* Layered gradients for depth */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(10,14,26,0.92) 0%, rgba(10,14,26,0.5) 50%, rgba(10,14,26,0.1) 100%)'
          }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(10,14,26,1) 0%, rgba(10,14,26,0.4) 40%, transparent 70%)'
          }} />

          <div className="absolute inset-0 flex items-end px-6 pb-8 md:px-10 md:pb-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary-light bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-full">Featured</span>
                <span className="text-[10px] font-semibold text-gray-400">{heroMovie.year}</span>
                {heroMovie.user_rating > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                    <Star weight="fill" size={10} /> {heroMovie.user_rating.toFixed(1)}
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-3">{heroMovie.title}</h2>
              {heroMovie.plot_overview && (
                <p className="text-sm text-gray-400 line-clamp-2 hidden sm:block mb-4 max-w-md">{heroMovie.plot_overview}</p>
              )}
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all group-hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #6c63ff, #4f46e5)', boxShadow: '0 0 0 1px rgba(108,99,255,0.4), 0 8px 24px rgba(108,99,255,0.3)' }}
                >
                  <Play weight="fill" size={14} /> Watch Now
                </button>
                {heroMovie.genre_names?.slice(0, 2).map(g => (
                  <span key={g} className="text-[11px] text-gray-500 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full hidden sm:inline">{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* ── Header + Search ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
              <FilmSlate weight="duotone" size={22} className="text-primary-light" />
              Movies & TV
            </h1>
            <p className="text-gray-600 text-sm mt-0.5">Stream free in any language — no subscription</p>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="relative">
          <MagnifyingGlass
            weight="bold"
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
          />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search movies, shows, actors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-1"
            >
              <X weight="bold" size={14} />
            </button>
          )}
        </div>

        {/* ── API Error ── */}
        {apiError && !search && (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center space-y-3">
            <FilmSlate weight="duotone" size={40} className="text-gray-700 mx-auto" />
            <p className="font-semibold text-white">Movie library unavailable right now</p>
            <p className="text-sm text-gray-500">The external movie provider is not responding. Try again later.</p>
            <button
              onClick={loadRails}
              className="px-5 py-2 bg-primary hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              ↺ Retry
            </button>
          </div>
        )}

        {/* ── Search Results ── */}
        {search.trim() && (
          <div>
            <h2 className="text-sm font-bold text-gray-400 mb-5">
              {searching ? 'Searching…' : searchResults.length > 0
                ? `${searchResults.length} results for "${search}"`
                : `No results for "${search}"`}
            </h2>
            {searching ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {Array.from({ length: 16 }).map((_, i) => <PosterSkeleton key={i} />)}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {searchResults.map((m) => (
                  <MovieCard key={m.id} movie={m} onClick={() => navigate(movieWatchUrl(m))} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Try a different title or language.</p>
            )}
          </div>
        )}

        {/* ── Browse Mode ── */}
        {!search.trim() && !apiError && (
          <>
            {/* Tab switcher */}
            <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                All Content
              </button>
              <button
                onClick={() => setActiveTab('world')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'world'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <Globe weight="duotone" size={14} />
                World Cinema
              </button>
            </div>

            {/* World Cinema banner */}
            {activeTab === 'world' && (
              <div className="relative overflow-hidden rounded-2xl border border-white/8 p-6 md:p-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(56,189,248,0.08) 50%, rgba(236,72,153,0.08) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at top right, #a78bfa, transparent 70%)' }} />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                    <Globe weight="duotone" size={24} className="text-primary-light" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white mb-1 tracking-tight">World Cinema</h2>
                    <p className="text-sm text-gray-500 max-w-lg">
                      Explore cinema from every corner of the globe — Arabic, Korean, Bollywood, French, Turkish dramas, Japanese anime, and more. All free, all in one place.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {['🇸🇦 Arabic', '🇰🇷 Korean', '🇮🇳 Hindi', '🇫🇷 French', '🇪🇸 Spanish', '🇹🇷 Turkish', '🇯🇵 Japanese', '🌍 African', '🇧🇷 Portuguese'].map(flag => (
                        <span key={flag} className="text-xs text-gray-400 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">{flag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skeletons */}
            {loading && (
              <div className="space-y-10">
                {[1, 2, 3].map((i) => (
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

            {/* Rails */}
            {!loading && visibleRails.map(({ key, label, icon, accent }) => {
              const movies = rails[key]
              if (!movies?.length) return null
              return (
                <section key={key}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-2 text-[15px] font-bold text-white tracking-tight">
                      <span style={{ color: accent }}>{icon}</span>
                      {label}
                    </h2>
                    <button className="flex items-center gap-1 text-[12px] font-medium text-gray-600 hover:text-gray-300 transition-colors">
                      See all <ArrowRight size={11} />
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {movies.map((m) => (
                      <div key={m.id} className="shrink-0 w-[120px] sm:w-[140px]">
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
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */

function MovieCard({ movie, onClick }: { movie: Movie; onClick: () => void }) {
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-2 mb-2">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-2">
            <FilmSlate weight="duotone" size={32} className="text-gray-700" />
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-4 gap-2">
          <div className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg">
            <Play weight="fill" size={10} /> Watch
          </div>
        </div>
        {/* Rating badge */}
        {movie.user_rating > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <Star weight="fill" size={9} /> {movie.user_rating.toFixed(1)}
          </div>
        )}
        {/* Type badge */}
        {movie.type === 'tv_series' && (
          <div className="absolute top-2 left-2 bg-emerald-500/80 backdrop-blur-sm text-white text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-wider">
            SERIES
          </div>
        )}
      </div>
      <p className="text-[12px] font-semibold text-white truncate tracking-tight">{movie.title}</p>
      <p className="text-[10px] text-gray-600 mt-0.5">{movie.year}</p>
    </div>
  )
}

function PosterSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-xl bg-surface-2 mb-2" />
      <div className="h-3 bg-surface-2 rounded w-3/4 mb-1.5" />
      <div className="h-2.5 bg-surface-2 rounded w-1/2" />
    </div>
  )
}

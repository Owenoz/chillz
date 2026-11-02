import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FilmSlate, Play, MagnifyingGlass, X, ArrowRight,
  Translate, SpinnerGap, Microphone, Star,
} from '@phosphor-icons/react'
import {
  TMDB_RAILS, searchTMDB, tmdbImage,
  type TMDBMovie,
} from '../lib/tmdbApi'
import { getLugaMovies, searchLuga, normaliseVj, type LugaMovie } from '../lib/lugaflixApi'

type Tab = 'movies' | 'translated'

const RAIL_COLORS: Record<string, string> = {
  nowPlaying: '#ef4444', trending: '#f97316', popular: '#f59e0b',
  topRated: '#fbbf24', upcoming: '#a78bfa', action: '#ef4444',
  drama: '#6366f1', comedy: '#10b981', thriller: '#8b5cf6',
  horror: '#dc2626', scifi: '#38bdf8', tvShows: '#06b6d4',
}

type RailsState = Record<string, TMDBMovie[]>

function tmdbWatchPath(m: TMDBMovie): string {
  const type = m.media_type === 'tv' || m.name ? 'tv' : 'movie'
  const title = encodeURIComponent(m.title || m.name || '')
  const poster = encodeURIComponent(m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '')
  const year = (m.release_date || m.first_air_date || '').slice(0, 4)
  const rating = m.vote_average?.toFixed(1) || ''
  const overview = encodeURIComponent((m.overview || '').slice(0, 200))
  return `/movies/tmdb/${m.id}?type=${type}&title=${title}&poster=${poster}&year=${year}&rating=${rating}&plot=${overview}`
}

function lugaWatchPath(m: LugaMovie): string {
  return `/movies/luga/${m.id}?title=${encodeURIComponent(m.title)}&poster=${encodeURIComponent(m.thumbnail_url)}&vj=${encodeURIComponent(normaliseVj(m.vj))}&url=${encodeURIComponent(m.url)}`
}

export default function MoviesPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('movies')

  // ── TMDB (non-translated) ──────────────────────────────────
  const [rails, setRails]           = useState<RailsState>({})
  const [tmdbLoading, setTmdbLoading] = useState(true)
  const [tmdbError, setTmdbError]   = useState(false)
  const [search, setSearch]         = useState('')
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([])
  const [searching, setSearching]   = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  // ── LugaFlix (translated) ──────────────────────────────────
  const [lugaMovies, setLugaMovies] = useState<LugaMovie[]>([])
  const [lugaLoading, setLugaLoading] = useState(false)
  const [lugaTotal, setLugaTotal]   = useState(0)
  const [lugaPage, setLugaPage]     = useState(1)
  const [lugaSearch, setLugaSearch] = useState('')
  const [lugaSearchResults, setLugaSearchResults] = useState<LugaMovie[]>([])
  const [lugaSearching, setLugaSearching] = useState(false)
  const [lugaFilter, setLugaFilter] = useState<'all' | 'Movie' | 'Series'>('all')
  const lugaSearchTimer = useRef<ReturnType<typeof setTimeout>>()
  const loaderRef = useRef<HTMLDivElement>(null)

  // Load TMDB rails
  const loadTMDB = useCallback(async () => {
    setTmdbLoading(true); setTmdbError(false)
    try {
      const first = await TMDB_RAILS[0].fetch()
      if (!first.length) { setTmdbError(true); setTmdbLoading(false); return }
      setRails({ [TMDB_RAILS[0].key]: first })
      setTmdbLoading(false)
      const rest = await Promise.all(TMDB_RAILS.slice(1).map(r => r.fetch()))
      setRails(prev => {
        const u = { ...prev }
        TMDB_RAILS.slice(1).forEach((r, i) => { u[r.key] = rest[i] })
        return u
      })
    } catch { setTmdbError(true); setTmdbLoading(false) }
  }, [])
  useEffect(() => { loadTMDB() }, [loadTMDB])

  // Load LugaFlix page
  const loadLuga = useCallback(async (page: number) => {
    setLugaLoading(true)
    try {
      const data = await getLugaMovies(page, 40)
      setLugaTotal(data.data.pagination.total)
      if (page === 1) setLugaMovies(data.data.items)
      else setLugaMovies(prev => [...prev, ...data.data.items])
    } catch { /* silent */ }
    finally { setLugaLoading(false) }
  }, [])

  useEffect(() => {
    if (tab === 'translated' && lugaMovies.length === 0) loadLuga(1)
  }, [tab])

  // Infinite scroll for LugaFlix
  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !lugaLoading && !lugaSearch) {
        const nextPage = lugaPage + 1
        setLugaPage(nextPage)
        loadLuga(nextPage)
      }
    }, { rootMargin: '400px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [lugaLoading, lugaPage, lugaSearch])

  // TMDB debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current)
    if (!search.trim()) { setSearchResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      const r = await searchTMDB(search.trim())
      setSearchResults(r); setSearching(false)
    }, 450)
    return () => clearTimeout(searchTimer.current)
  }, [search])

  // LugaFlix debounced search
  useEffect(() => {
    clearTimeout(lugaSearchTimer.current)
    if (!lugaSearch.trim()) { setLugaSearchResults([]); return }
    lugaSearchTimer.current = setTimeout(async () => {
      setLugaSearching(true)
      const r = await searchLuga(lugaSearch.trim())
      setLugaSearchResults(r); setLugaSearching(false)
    }, 500)
    return () => clearTimeout(lugaSearchTimer.current)
  }, [lugaSearch])

  const hero = rails['nowPlaying']?.[0] || rails['trending']?.[0]
  const lugaHero = lugaMovies[0]

  const visibleLuga = lugaSearch
    ? lugaSearchResults
    : lugaFilter === 'all'
    ? lugaMovies
    : lugaMovies.filter(m => m.type === lugaFilter)

  return (
    <div className="bg-mesh min-h-screen pb-6">

      {/* ── Hero ── */}
      {tab === 'movies' && hero && !search && (
        <div className="relative overflow-hidden cursor-pointer group"
          style={{ aspectRatio: '21/9', minHeight: 220, maxHeight: 460 }}
          onClick={() => navigate(tmdbWatchPath(hero))}>
          <img
            src={tmdbImage(hero.backdrop_path, 'w1280')}
            alt={hero.title || hero.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(10,10,15,0.96) 0%,rgba(10,10,15,0.55) 55%,rgba(10,10,15,0.1) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#0A0A0F 0%,transparent 55%)' }} />
          <div className="absolute inset-0 flex items-end px-6 pb-7 md:px-10 md:pb-10">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black tracking-widest uppercase text-primary-light bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-full">Now Playing</span>
                {hero.vote_average > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                    <Star weight="fill" size={10} /> {hero.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-3">{hero.title || hero.name}</h2>
              {hero.overview && (
                <p className="text-sm text-muted line-clamp-2 hidden sm:block mb-4 max-w-md">{hero.overview.slice(0, 140)}</p>
              )}
              <button className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
                <Play weight="fill" size={14} /> Play Now
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'translated' && lugaHero && !lugaSearch && (
        <div className="relative overflow-hidden cursor-pointer group"
          style={{ aspectRatio: '21/9', minHeight: 200, maxHeight: 380 }}
          onClick={() => navigate(lugaWatchPath(lugaHero))}>
          <img src={lugaHero.thumbnail_url} alt={lugaHero.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(10,10,15,0.96) 0%,rgba(10,10,15,0.55) 55%,rgba(10,10,15,0.1) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#0A0A0F 0%,transparent 55%)' }} />
          <div className="absolute inset-0 flex items-end px-6 pb-7 md:px-10 md:pb-10">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-primary-light bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-full">
                  <Translate size={10} /> Luganda · {normaliseVj(lugaHero.vj)}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-3">{lugaHero.title}</h2>
              <button className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
                <Play weight="fill" size={14} /> Watch Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-5 space-y-6 pt-6">

        {/* ── Tab switcher ── */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit"
          style={{ background: 'rgba(19,17,28,0.9)', border: '1px solid rgba(45,38,69,0.7)' }}>
          <button onClick={() => setTab('movies')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: tab === 'movies' ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
              color: tab === 'movies' ? '#fff' : '#7C7A91',
              boxShadow: tab === 'movies' ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
            }}>
            <FilmSlate weight="duotone" size={15} /> Movies & TV
          </button>
          <button onClick={() => setTab('translated')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: tab === 'translated' ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
              color: tab === 'translated' ? '#fff' : '#7C7A91',
              boxShadow: tab === 'translated' ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
            }}>
            <Translate weight="duotone" size={15} /> VJ Translated
            {lugaTotal > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: tab === 'translated' ? '#fff' : '#7C7A91' }}>
                {(lugaTotal / 1000).toFixed(0)}k+
              </span>
            )}
          </button>
        </div>

        {/* ══════════ MOVIES TAB ══════════ */}
        {tab === 'movies' && (
          <>
            <div className="relative">
              <MagnifyingGlass weight="bold" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input type="text" placeholder="Search movies, shows, actors…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-muted focus:outline-none"
                style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"><X weight="bold" size={14} /></button>}
            </div>

            {tmdbError && !search && (
              <div className="rounded-2xl p-8 text-center border border-border bg-surface space-y-3">
                <FilmSlate weight="duotone" size={36} className="text-muted opacity-40 mx-auto" />
                <p className="font-bold text-white">Couldn't load movies</p>
                <button onClick={loadTMDB} className="btn-primary px-5 py-2 rounded-xl text-sm font-bold text-white">↺ Retry</button>
              </div>
            )}

            {search.trim() && (
              <div>
                <p className="text-sm text-muted mb-4">
                  {searching ? 'Searching…' : `${searchResults.length} results for "${search}"`}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {searching
                    ? Array.from({length:12}).map((_,i) => <Skeleton key={i} />)
                    : searchResults.map(m => <TMDBCard key={m.id} movie={m} onClick={() => navigate(tmdbWatchPath(m))} />)
                  }
                </div>
              </div>
            )}

            {tmdbLoading && !search && (
              <div className="space-y-8">
                {[1,2,3].map(i => (
                  <div key={i}>
                    <div className="h-5 w-40 rounded-xl skeleton mb-4" />
                    <div className="flex gap-3 overflow-hidden">
                      {Array.from({length:6}).map((_,j) => <div key={j} className="shrink-0 w-32 aspect-[2/3] rounded-2xl skeleton" />)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!search && !tmdbError && !tmdbLoading && TMDB_RAILS.map(({ key, label }) => {
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
                    <button className="text-xs font-semibold text-primary-light hover:text-white flex items-center gap-1">
                      See all <ArrowRight size={11} />
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {movies.map(m => (
                      <div key={m.id} className="shrink-0 w-[120px] sm:w-[140px]">
                        <TMDBCard movie={m} onClick={() => navigate(tmdbWatchPath(m))} />
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}

        {/* ══════════ TRANSLATED TAB ══════════ */}
        {tab === 'translated' && (
          <>
            {/* Info banner */}
            <div className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(236,72,153,0.06))', border: '1px solid rgba(124,58,237,0.25)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                <Microphone weight="fill" size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-white">Luganda VJ Translated</p>
                <p className="text-[11px] text-muted mt-0.5">
                  {lugaTotal > 0 ? `${lugaTotal.toLocaleString()} titles` : 'Loading…'} · Direct MP4 · No ads · No redirects
                </p>
              </div>
            </div>

            {/* Search + type filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass weight="bold" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input type="text" placeholder="Search VJ movies…" value={lugaSearch}
                  onChange={e => setLugaSearch(e.target.value)}
                  className="w-full rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-muted focus:outline-none"
                  style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
                {lugaSearch && <button onClick={() => setLugaSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"><X weight="bold" size={13} /></button>}
              </div>
              <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
                {(['all','Movie','Series'] as const).map(v => (
                  <button key={v} onClick={() => setLugaFilter(v)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: lugaFilter === v ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                      color: lugaFilter === v ? '#fff' : '#7C7A91',
                    }}>
                    {v === 'all' ? 'All' : v}
                  </button>
                ))}
              </div>
            </div>

            {lugaSearching && (
              <div className="flex items-center gap-2 text-muted text-sm py-4">
                <SpinnerGap weight="bold" size={16} className="animate-spin" /> Searching…
              </div>
            )}

            {/* Grid */}
            {!lugaSearching && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {visibleLuga.map(m => (
                  <LugaCard key={m.id} movie={m} onClick={() => navigate(lugaWatchPath(m))} />
                ))}
                {lugaLoading && Array.from({length:8}).map((_,i) => <Skeleton key={i} />)}
              </div>
            )}

            {/* Infinite scroll trigger */}
            {!lugaSearch && (
              <div ref={loaderRef} className="py-4 flex justify-center">
                {lugaLoading && <SpinnerGap weight="bold" size={20} className="text-muted animate-spin" />}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

/* ── TMDB Card ── */
function TMDBCard({ movie: m, onClick }: { movie: TMDBMovie; onClick: () => void }) {
  const [err, setErr] = useState(false)
  const title = m.title || m.name || ''
  const year = (m.release_date || m.first_air_date || '').slice(0, 4)
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2"
        style={{ background: 'rgba(19,17,28,0.8)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
        {m.poster_path && !err ? (
          <img src={`https://image.tmdb.org/t/p/w342${m.poster_path}`} alt={title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FilmSlate weight="duotone" size={28} className="text-muted opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
          <div className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-glow-sm">
            <Play weight="fill" size={10} /> Play
          </div>
        </div>
        {m.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
            <Star weight="fill" size={8} /> {m.vote_average.toFixed(1)}
          </div>
        )}
        {(m.media_type === 'tv' || m.name) && (
          <div className="absolute top-2 left-2 bg-cyan-500/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">TV</div>
        )}
      </div>
      <p className="text-[12px] font-bold text-white truncate tracking-tight">{title}</p>
      <p className="text-[10px] text-muted mt-0.5">{year || '—'}</p>
    </div>
  )
}

/* ── LugaFlix Card ── */
function LugaCard({ movie: m, onClick }: { movie: LugaMovie; onClick: () => void }) {
  const [err, setErr] = useState(false)
  const vj = normaliseVj(m.vj)
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2"
        style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(19,17,28,0.9))', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
        {m.thumbnail_url && !err ? (
          <img src={m.thumbnail_url} alt={m.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Microphone weight="duotone" size={28} className="text-primary-light opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
          <div className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-glow-sm">
            <Play weight="fill" size={10} /> Watch
          </div>
        </div>
        <div className="absolute top-2 left-2 text-[8px] font-black px-1.5 py-0.5 rounded-md text-white"
          style={{ background: m.type === 'Series' ? 'rgba(16,185,129,0.85)' : 'rgba(124,58,237,0.85)' }}>
          {m.type === 'Series' ? 'SERIES' : 'MOVIE'}
        </div>
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-lg">
          <Translate weight="bold" size={9} className="text-primary-light" />
        </div>
      </div>
      <p className="text-[11px] font-bold text-white truncate tracking-tight">{m.title}</p>
      <p className="text-[9px] text-muted mt-0.5 truncate">{vj}</p>
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

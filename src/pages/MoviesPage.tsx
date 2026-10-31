import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FilmSlate, Play, MagnifyingGlass, X, ArrowRight,
  Translate, SpinnerGap, Microphone,
} from '@phosphor-icons/react'
import { fetchIARail, searchIA, genres as getGenres, IA_RAILS, type IAMovie } from '../lib/archiveApi'

// ── Types ─────────────────────────────────────────────────────
interface VJMovie {
  id: string   // tmdb:XXXXX
  n:  string   // name
  p:  string   // poster
  t:  string   // type: movie | series
  u:  string   // embed url (s-u.in detail page)
}

type Tab = 'free' | 'translated'

const RAIL_COLORS: Record<string, string> = {
  popular: '#F59E0B', action: '#EF4444', drama: '#6366F1',
  comedy: '#10B981', thriller: '#8B5CF6', scifi: '#38BDF8',
  classic: '#F97316', western: '#A16207', romance: '#EC4899', documentary: '#64748B',
}

type RailsState = Record<string, IAMovie[]>

function moviePath(m: IAMovie) {
  return `/movies/watch/${encodeURIComponent(m.identifier)}?title=${encodeURIComponent(m.title)}&year=${m.year}&poster=${encodeURIComponent(m.thumb || '')}`
}

// ── VJ Movie watch path ────────────────────────────────────────
function vjPath(m: VJMovie) {
  return `/movies/vj/${encodeURIComponent(m.id)}?title=${encodeURIComponent(m.n)}&poster=${encodeURIComponent(m.p)}&type=${m.t}`
}

export default function MoviesPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('free')

  // ── Free movies (Internet Archive) ──────────────────────────
  const [rails, setRails]               = useState<RailsState>({})
  const [loading, setLoading]           = useState(true)
  const [apiError, setApiError]         = useState(false)
  const [search, setSearch]             = useState('')
  const [searchResults, setSearchResults] = useState<IAMovie[]>([])
  const [searching, setSearching]       = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  // ── VJ Translated (MovieBay) ─────────────────────────────────
  const [vjMovies, setVjMovies]         = useState<VJMovie[]>([])
  const [vjLoading, setVjLoading]       = useState(false)
  const [vjSearch, setVjSearch]         = useState('')
  const [vjPage, setVjPage]             = useState(1)
  const [vjFilter, setVjFilter]         = useState<'all' | 'movie' | 'series'>('all')
  const vjLoaderRef = useRef<HTMLDivElement>(null)
  const PAGE_SIZE = 40

  // Load IA rails
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

  // Load VJ movies from public JSON
  useEffect(() => {
    if (vjMovies.length > 0) return
    setVjLoading(true)
    fetch('/vj-translated.json')
      .then(r => r.json())
      .then((data: VJMovie[]) => { setVjMovies(data); setVjLoading(false) })
      .catch(() => setVjLoading(false))
  }, [])

  // IA debounced search
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

  // Infinite scroll for VJ tab
  useEffect(() => {
    const el = vjLoaderRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && vjPage * PAGE_SIZE < filteredVj.length)
        setVjPage(p => p + 1)
    }, { rootMargin: '300px' })
    obs.observe(el)
    return () => obs.disconnect()
  })

  // Reset VJ page on filter/search change
  useEffect(() => { setVjPage(1) }, [vjSearch, vjFilter])

  const filteredVj = vjMovies.filter(m => {
    const q = vjSearch.toLowerCase().trim()
    const matchSearch = !q || m.n.toLowerCase().includes(q)
    const matchType = vjFilter === 'all' || m.t === vjFilter
    return matchSearch && matchType
  })
  const visibleVj = filteredVj.slice(0, vjPage * PAGE_SIZE)

  const hero = rails[IA_RAILS[0].key]?.[0]

  return (
    <div className="bg-mesh min-h-screen pb-6">

      {/* ── Cinematic Hero (only on free tab) ── */}
      {tab === 'free' && !search && hero && (
        <div className="relative overflow-hidden cursor-pointer group"
          style={{ aspectRatio: '21/9', minHeight: 200, maxHeight: 420 }}
          onClick={() => navigate(moviePath(hero))}>
          <img src={hero.thumb} alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(10,10,15,0.96) 0%,rgba(10,10,15,0.6) 55%,rgba(10,10,15,0.15) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#0A0A0F 0%,transparent 55%)' }} />
          <div className="absolute inset-0 flex items-end px-6 pb-7 md:px-10 md:pb-10">
            <div className="max-w-lg">
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary-light bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-full mb-3 inline-block">
                Free · No Signup
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-3">{hero.title}</h2>
              <button className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
                <Play weight="fill" size={14} /> Play Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VJ Hero (translated tab) ── */}
      {tab === 'translated' && !vjSearch && vjMovies.length > 0 && (() => {
        const h = vjMovies[0]
        return (
          <div className="relative overflow-hidden cursor-pointer group"
            style={{ aspectRatio: '21/9', minHeight: 200, maxHeight: 380 }}
            onClick={() => navigate(vjPath(h))}>
            <img src={h.p} alt={h.n}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(10,10,15,0.96) 0%,rgba(10,10,15,0.55) 55%,rgba(10,10,15,0.1) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#0A0A0F 0%,transparent 55%)' }} />
            <div className="absolute inset-0 flex items-end px-6 pb-7 md:px-10 md:pb-10">
              <div className="max-w-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary-light bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Translate weight="duotone" size={10} /> Luganda VJ
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-3">{h.n}</h2>
                <button className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
                  <Play weight="fill" size={14} /> Watch Now
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      <div className="max-w-7xl mx-auto px-5 space-y-6 pt-6">

        {/* ── Tab switcher ── */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit"
          style={{ background: 'rgba(19,17,28,0.9)', border: '1px solid rgba(45,38,69,0.7)' }}>
          <button onClick={() => setTab('free')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: tab === 'free' ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
              color: tab === 'free' ? '#fff' : '#7C7A91',
              boxShadow: tab === 'free' ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
            }}>
            <FilmSlate weight="duotone" size={15} />
            Free Movies
          </button>
          <button onClick={() => setTab('translated')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: tab === 'translated' ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
              color: tab === 'translated' ? '#fff' : '#7C7A91',
              boxShadow: tab === 'translated' ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
            }}>
            <Translate weight="duotone" size={15} />
            VJ Translated
            {vjMovies.length > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: tab === 'translated' ? '#fff' : '#7C7A91' }}>
                {vjMovies.length.toLocaleString()}
              </span>
            )}
          </button>
        </div>

        {/* ══════════════ FREE MOVIES TAB ══════════════ */}
        {tab === 'free' && (
          <>
            {/* Search */}
            <div className="relative">
              <MagnifyingGlass weight="bold" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input type="text" placeholder="Search free movies…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-muted focus:outline-none"
                style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                  <X weight="bold" size={14} />
                </button>
              )}
            </div>

            {apiError && (
              <div className="rounded-2xl p-8 text-center border border-border bg-surface space-y-3">
                <FilmSlate weight="duotone" size={36} className="text-muted opacity-40 mx-auto" />
                <p className="font-bold text-white">Movie library unavailable</p>
                <button onClick={loadRails} className="btn-primary px-5 py-2 rounded-xl text-sm font-bold text-white">↺ Retry</button>
              </div>
            )}

            {/* Search results */}
            {search.trim() && (
              <div>
                <p className="text-sm text-muted mb-4">
                  {searching ? 'Searching…' : `${searchResults.length} results for "${search}"`}
                </p>
                {searching ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {Array.from({length:12}).map((_,i) => <Skeleton key={i} />)}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {searchResults.map(m => <IACard key={m.identifier} movie={m} onClick={() => navigate(moviePath(m))} />)}
                  </div>
                ) : <p className="text-muted text-sm">No results.</p>}
              </div>
            )}

            {/* Skeletons while loading */}
            {loading && !search && (
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

            {/* Rails */}
            {!search && !apiError && !loading && IA_RAILS.map(({ key, label }) => {
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
                      <div key={m.identifier} className="shrink-0 w-[120px] sm:w-[140px]">
                        <IACard movie={m} onClick={() => navigate(moviePath(m))} />
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}

        {/* ══════════════ VJ TRANSLATED TAB ══════════════ */}
        {tab === 'translated' && (
          <>
            {/* Info banner */}
            <div className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(236,72,153,0.06))', border: '1px solid rgba(124,58,237,0.25)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                <Microphone weight="fill" size={22} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Luganda VJ Translated Movies</p>
                <p className="text-[11px] text-muted mt-0.5">
                  {vjMovies.length.toLocaleString()} titles — VJ Junior, VJ Ice P, VJ Emmy, VJ Banks & more
                </p>
              </div>
            </div>

            {/* Search + filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass weight="bold" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input type="text" placeholder="Search VJ movies…" value={vjSearch}
                  onChange={e => setVjSearch(e.target.value)}
                  className="w-full rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-muted focus:outline-none"
                  style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
                {vjSearch && (
                  <button onClick={() => setVjSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                    <X weight="bold" size={13} />
                  </button>
                )}
              </div>

              {/* Type filter */}
              <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
                {([['all','All'], ['movie','Movies'], ['series','Series']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setVjFilter(val)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: vjFilter === val ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                      color: vjFilter === val ? '#fff' : '#7C7A91',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted">
              <span className="text-white font-bold">{filteredVj.length.toLocaleString()}</span> titles
            </p>

            {/* Loading */}
            {vjLoading && (
              <div className="flex items-center justify-center py-20 gap-3">
                <SpinnerGap weight="bold" size={28} className="text-primary animate-spin" />
                <p className="text-muted text-sm">Loading VJ movies…</p>
              </div>
            )}

            {/* Grid with infinite scroll */}
            {!vjLoading && (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {visibleVj.map(m => (
                    <VJCard key={m.id} movie={m} onClick={() => navigate(vjPath(m))} />
                  ))}
                </div>

                {/* Infinite scroll trigger */}
                <div ref={vjLoaderRef} className="flex justify-center py-4">
                  {vjPage * PAGE_SIZE < filteredVj.length && (
                    <SpinnerGap weight="bold" size={20} className="text-muted animate-spin" />
                  )}
                </div>

                {filteredVj.length === 0 && (
                  <div className="text-center py-16">
                    <Translate weight="duotone" size={40} className="text-muted opacity-40 mx-auto mb-3" />
                    <p className="text-muted">No results found</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ── IA Movie Card ── */
function IACard({ movie, onClick }: { movie: IAMovie; onClick: () => void }) {
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
          <div className="absolute top-2 left-2 bg-primary/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">{gs[0].slice(0,8)}</div>
        )}
      </div>
      <p className="text-[12px] font-bold text-white truncate">{movie.title}</p>
      <p className="text-[10px] text-muted mt-0.5">{movie.year || 'Classic'}</p>
    </div>
  )
}

/* ── VJ Movie Card ── */
function VJCard({ movie, onClick }: { movie: VJMovie; onClick: () => void }) {
  const [err, setErr] = useState(false)
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2"
        style={{ background: 'rgba(19,17,28,0.8)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
        {movie.p && !err ? (
          <img src={movie.p} alt={movie.n} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(19,17,28,0.9))' }}>
            <Microphone weight="duotone" size={28} className="text-primary-light opacity-40" />
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-3">
          <div className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-glow-sm">
            <Play weight="fill" size={10} /> Watch
          </div>
        </div>
        {/* Type badge */}
        <div className="absolute top-2 left-2 text-[8px] font-black px-1.5 py-0.5 rounded-md text-white"
          style={{ background: movie.t === 'series' ? 'rgba(16,185,129,0.85)' : 'rgba(124,58,237,0.85)' }}>
          {movie.t === 'series' ? 'SERIES' : 'MOVIE'}
        </div>
        {/* VJ translate badge */}
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <Translate weight="bold" size={10} className="text-primary-light" />
        </div>
      </div>
      <p className="text-[12px] font-bold text-white truncate tracking-tight">{movie.n}</p>
      <p className="text-[9px] text-muted mt-0.5 uppercase tracking-wider">Luganda</p>
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

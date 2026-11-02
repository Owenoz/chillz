import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FilmSlate, Play, MagnifyingGlass, X,
  Translate, SpinnerGap, Microphone, Star, ArrowRight,
} from '@phosphor-icons/react'
import { normaliseVj } from '../lib/lugaflixApi'

// ── Narabox / LugaFlix static movie ─────────────────────────
interface LM {
  id: string
  t:  string   // title
  v:  string   // vj
  p:  string   // poster (TMDB)
  u:  string   // direct MP4 url
  y:  string   // year
  tp: string   // Movie | Series
  ov?: string  // overview
}

// ── TMDB movie ───────────────────────────────────────────────
interface TM {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  media_type?: string
}

type Tab = 'movies' | 'translated'
type RailsState = Record<string, TM[]>

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMDUxNTkyM2M2MzgxZDc2NDNkODk0OTk3OTZiZmFmMCIsIm5iZiI6MTY5NDg3MzY4OC4wMzMsInN1YiI6IjY1MDViODU4Mzk0YTg3MDExYzljYWQxZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.QRNylr5k3CEf1L0KBcpHUrht_6I966N0ZqCO5jbRLy8'
const TMDB_HEADERS = { Authorization: `Bearer ${TMDB_TOKEN}`, Accept: 'application/json' }
const TMDB = 'https://api.themoviedb.org/3'
const IMG  = 'https://image.tmdb.org/t/p'

async function tmdbGet(endpoint: string): Promise<TM[]> {
  try {
    const r = await fetch(`${TMDB}/${endpoint}`, { headers: TMDB_HEADERS })
    if (!r.ok) return []
    const d = await r.json()
    return Array.isArray(d?.results) ? d.results : []
  } catch { return [] }
}

const RAILS: { key: string; label: string; color: string; endpoint: string }[] = [
  { key:'nowPlaying', label:'Now Playing',    color:'#ef4444', endpoint:'movie/now_playing' },
  { key:'trending',   label:'Trending',        color:'#f97316', endpoint:'trending/movie/week' },
  { key:'popular',    label:'Popular',          color:'#f59e0b', endpoint:'movie/popular' },
  { key:'topRated',   label:'Top Rated',       color:'#fbbf24', endpoint:'movie/top_rated' },
  { key:'upcoming',   label:'Upcoming',         color:'#a78bfa', endpoint:'movie/upcoming' },
  { key:'action',     label:'Action',           color:'#ef4444', endpoint:'discover/movie?with_genres=28&sort_by=popularity.desc' },
  { key:'drama',      label:'Drama',            color:'#6366f1', endpoint:'discover/movie?with_genres=18&sort_by=popularity.desc' },
  { key:'comedy',     label:'Comedy',           color:'#10b981', endpoint:'discover/movie?with_genres=35&sort_by=popularity.desc' },
  { key:'thriller',   label:'Thriller',         color:'#8b5cf6', endpoint:'discover/movie?with_genres=53&sort_by=popularity.desc' },
  { key:'horror',     label:'Horror',           color:'#dc2626', endpoint:'discover/movie?with_genres=27&sort_by=popularity.desc' },
  { key:'scifi',      label:'Sci-Fi',           color:'#38bdf8', endpoint:'discover/movie?with_genres=878&sort_by=popularity.desc' },
  { key:'tvShows',    label:'TV Shows',         color:'#06b6d4', endpoint:'tv/popular' },
]

function tmdbPath(m: TM) {
  const type   = m.media_type === 'tv' || m.name ? 'tv' : 'movie'
  const title  = encodeURIComponent(m.title || m.name || '')
  const poster = encodeURIComponent(m.poster_path ? `${IMG}/w500${m.poster_path}` : '')
  const year   = (m.release_date || m.first_air_date || '').slice(0, 4)
  const rating = m.vote_average?.toFixed(1) || ''
  const plot   = encodeURIComponent((m.overview || '').slice(0, 200))
  return `/movies/tmdb/${m.id}?type=${type}&title=${title}&poster=${poster}&year=${year}&rating=${rating}&plot=${plot}`
}

function lugaPath(m: LM) {
  return `/movies/luga/${encodeURIComponent(m.id)}?title=${encodeURIComponent(m.t)}&poster=${encodeURIComponent(m.p)}&vj=${encodeURIComponent(normaliseVj(m.v))}&url=${encodeURIComponent(m.u)}&ov=${encodeURIComponent(m.ov||'')}`
}

const PAGE = 40

export default function MoviesPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('movies')

  // ── TMDB ─────────────────────────────────────────────────
  const [rails, setRails]         = useState<RailsState>({})
  const [tmdbLoading, setTmdbLoading] = useState(false)
  const [tmdbError, setTmdbError] = useState(false)
  const [tmdbSearch, setTmdbSearch] = useState('')
  const [tmdbSearchRes, setTmdbSearchRes] = useState<TM[]>([])
  const [tmdbSearching, setTmdbSearching] = useState(false)
  const tmdbTimer = useRef<ReturnType<typeof setTimeout>>()

  // ── Translated ────────────────────────────────────────────
  const [lugaAll, setLugaAll]   = useState<LM[]>([])
  const [lugaReady, setLugaReady] = useState(false)
  const [lugaError, setLugaError] = useState(false)
  const [lugaPage, setLugaPage] = useState(1)
  const [lugaQ, setLugaQ]       = useState('')
  const [lugaType, setLugaType] = useState<'all'|'Movie'|'Series'>('all')
  const loaderRef = useRef<HTMLDivElement>(null)

  // Load TMDB on first render
  useEffect(() => {
    setTmdbLoading(true)
    setTmdbError(false)
    // Load first rail immediately, rest in background
    tmdbGet(RAILS[0].endpoint)
      .then(first => {
        if (!first.length) { setTmdbError(true); setTmdbLoading(false); return }
        setRails({ [RAILS[0].key]: first })
        setTmdbLoading(false)
        // Background load rest
        Promise.all(RAILS.slice(1).map(r => tmdbGet(r.endpoint))).then(rest => {
          setRails(prev => {
            const u = { ...prev }
            RAILS.slice(1).forEach((r, i) => { u[r.key] = rest[i] })
            return u
          })
        }).catch(() => {/* background fail is ok */})
      })
      .catch(() => { setTmdbError(true); setTmdbLoading(false) })
  }, [])

  // Load translated static JSON
  useEffect(() => {
    fetch('/luga-movies.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: LM[]) => {
        if (!Array.isArray(d)) throw new Error('Not an array')
        setLugaAll(d)
        setLugaReady(true)
      })
      .catch(e => {
        console.error('[MoviesPage] Failed to load luga-movies.json:', e)
        setLugaError(true)
        setLugaReady(true)
      })
  }, [])

  // TMDB search debounce
  useEffect(() => {
    clearTimeout(tmdbTimer.current)
    if (!tmdbSearch.trim()) { setTmdbSearchRes([]); return }
    tmdbTimer.current = setTimeout(async () => {
      setTmdbSearching(true)
      const r = await tmdbGet(`search/multi?query=${encodeURIComponent(tmdbSearch.trim())}`)
      setTmdbSearchRes(r.filter(m => m.title || m.name))
      setTmdbSearching(false)
    }, 450)
    return () => clearTimeout(tmdbTimer.current)
  }, [tmdbSearch])

  // Reset luga page on filter change
  useEffect(() => { setLugaPage(1) }, [lugaQ, lugaType])

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleLuga.length < filteredLuga.length)
        setLugaPage(p => p + 1)
    }, { rootMargin: '500px' })
    obs.observe(el)
    return () => obs.disconnect()
  })

  const filteredLuga = useMemo(() => {
    const q = lugaQ.toLowerCase().trim()
    return lugaAll.filter(m => {
      const matchQ    = !q || m.t.toLowerCase().includes(q) || m.v.toLowerCase().includes(q)
      const matchType = lugaType === 'all' || m.tp === lugaType
      return matchQ && matchType
    })
  }, [lugaAll, lugaQ, lugaType])

  const visibleLuga = filteredLuga.slice(0, lugaPage * PAGE)

  const hero     = rails['nowPlaying']?.[0] || rails['trending']?.[0]
  const lugaHero = lugaAll[0]

  return (
    <div className="bg-mesh min-h-screen pb-6">

      {/* ── Hero ── */}
      {tab === 'movies' && !tmdbSearch && hero && (
        <div className="relative overflow-hidden cursor-pointer group"
          style={{ aspectRatio:'21/9', minHeight:220, maxHeight:460 }}
          onClick={() => navigate(tmdbPath(hero))}>
          {hero.backdrop_path && (
            <img src={`${IMG}/w1280${hero.backdrop_path}`} alt={hero.title||hero.name||''}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')} />
          )}
          <div className="absolute inset-0" style={{background:'linear-gradient(to right,rgba(10,10,15,0.96) 0%,rgba(10,10,15,0.55) 55%,rgba(10,10,15,0.1) 100%)'}}/>
          <div className="absolute inset-0" style={{background:'linear-gradient(to top,#0A0A0F 0%,transparent 55%)'}}/>
          <div className="absolute inset-0 flex items-end px-6 pb-7 md:px-10 md:pb-10">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black tracking-widest uppercase text-primary-light bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-full">Now Playing</span>
                {(hero.vote_average||0) > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                    <Star weight="fill" size={10}/>{hero.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-3">{hero.title||hero.name}</h2>
              {hero.overview && <p className="text-sm text-muted line-clamp-2 hidden sm:block mb-4 max-w-md">{hero.overview.slice(0,140)}</p>}
              <button className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
                <Play weight="fill" size={14}/>Play Now
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'translated' && !lugaQ && lugaHero && (
        <div className="relative overflow-hidden cursor-pointer group"
          style={{ aspectRatio:'21/9', minHeight:200, maxHeight:380 }}
          onClick={() => navigate(lugaPath(lugaHero))}>
          {lugaHero.p && (
            <img src={lugaHero.p} alt={lugaHero.t}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')} />
          )}
          <div className="absolute inset-0" style={{background:'linear-gradient(to right,rgba(10,10,15,0.96) 0%,rgba(10,10,15,0.55) 55%,rgba(10,10,15,0.1) 100%)'}}/>
          <div className="absolute inset-0" style={{background:'linear-gradient(to top,#0A0A0F 0%,transparent 55%)'}}/>
          <div className="absolute inset-0 flex items-end px-6 pb-7 md:px-10 md:pb-10">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-primary-light bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-full">
                  <Translate size={10}/> {normaliseVj(lugaHero.v)}
                </span>
                {lugaHero.y && <span className="text-[10px] text-muted">{lugaHero.y}</span>}
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-3">{lugaHero.t}</h2>
              <button className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
                <Play weight="fill" size={14}/>Watch Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-5 space-y-6 pt-6">

        {/* ── Tab switcher ── */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit"
          style={{background:'rgba(19,17,28,0.9)', border:'1px solid rgba(45,38,69,0.7)'}}>
          {([
            {key:'movies',     label:'Movies & TV',  Icon: FilmSlate},
            {key:'translated', label:'VJ Translated', Icon: Translate},
          ] as {key:Tab; label:string; Icon:React.ElementType}[]).map(({key, label, Icon}) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: tab===key ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                color: tab===key ? '#fff' : '#7C7A91',
                boxShadow: tab===key ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
              }}>
              <Icon weight="duotone" size={15}/>
              {label}
              {key==='translated' && lugaAll.length > 0 && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{background:'rgba(255,255,255,0.15)', color: tab==='translated'?'#fff':'#7C7A91'}}>
                  {lugaAll.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ MOVIES TAB ══ */}
        {tab === 'movies' && (
          <>
            {/* Search */}
            <div className="relative">
              <MagnifyingGlass weight="bold" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"/>
              <input type="text" placeholder="Search movies, shows…" value={tmdbSearch}
                onChange={e => setTmdbSearch(e.target.value)}
                className="w-full rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-muted focus:outline-none"
                style={{background:'rgba(19,17,28,0.8)', border:'1px solid rgba(45,38,69,0.8)'}}/>
              {tmdbSearch && (
                <button onClick={() => setTmdbSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                  <X weight="bold" size={14}/>
                </button>
              )}
            </div>

            {/* Error */}
            {tmdbError && !tmdbSearch && (
              <div className="rounded-2xl p-8 text-center border border-border bg-surface space-y-3">
                <FilmSlate weight="duotone" size={36} className="text-muted opacity-40 mx-auto"/>
                <p className="font-bold text-white">Couldn't load movies</p>
                <p className="text-sm text-muted">Check your connection and try again.</p>
                <button onClick={() => window.location.reload()}
                  className="btn-primary px-5 py-2 rounded-xl text-sm font-bold text-white">↺ Retry</button>
              </div>
            )}

            {/* Search results */}
            {tmdbSearch.trim() && (
              <div>
                <p className="text-sm text-muted mb-4">
                  {tmdbSearching ? 'Searching…' : `${tmdbSearchRes.length} results for "${tmdbSearch}"`}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {tmdbSearching
                    ? Array.from({length:12}).map((_,i) => <Skel key={i}/>)
                    : tmdbSearchRes.map(m => <TMDBCard key={m.id} m={m} onClick={() => navigate(tmdbPath(m))}/>)
                  }
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {tmdbLoading && !tmdbSearch && (
              <div className="space-y-8">
                {[1,2,3].map(i => (
                  <div key={i}>
                    <div className="h-5 w-40 rounded-xl skeleton mb-4"/>
                    <div className="flex gap-3 overflow-hidden">
                      {Array.from({length:6}).map((_,j) => <div key={j} className="shrink-0 w-32 aspect-[2/3] rounded-2xl skeleton"/>)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rails */}
            {!tmdbSearch && !tmdbLoading && !tmdbError && RAILS.map(({key, label, color}) => {
              const movies = rails[key]
              if (!movies?.length) return null
              return (
                <section key={key}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[15px] font-black text-white flex items-center gap-2">
                      <span className="w-1 h-5 rounded-full" style={{background:color}}/>
                      {label}
                    </h2>
                    <button className="text-xs font-semibold text-primary-light hover:text-white flex items-center gap-1">
                      See all <ArrowRight size={11}/>
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {movies.map(m => (
                      <div key={m.id} className="shrink-0 w-[120px] sm:w-[140px]">
                        <TMDBCard m={m} onClick={() => navigate(tmdbPath(m))}/>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}

        {/* ══ TRANSLATED TAB ══ */}
        {tab === 'translated' && (
          <>
            {/* Banner */}
            <div className="rounded-2xl p-4 flex items-center gap-4"
              style={{background:'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(236,72,153,0.06))', border:'1px solid rgba(124,58,237,0.25)'}}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}}>
                <Microphone weight="fill" size={22} className="text-white"/>
              </div>
              <div>
                <p className="text-sm font-black text-white">Luganda VJ Translated</p>
                <p className="text-[11px] text-muted mt-0.5">
                  {!lugaReady ? 'Loading…' : lugaError ? 'Failed to load' : `${lugaAll.length} titles`} · Direct MP4 · No ads
                </p>
              </div>
            </div>

            {/* Search + filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass weight="bold" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"/>
                <input type="text" placeholder="Search VJ movies…" value={lugaQ}
                  onChange={e => setLugaQ(e.target.value)}
                  className="w-full rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-muted focus:outline-none"
                  style={{background:'rgba(19,17,28,0.8)', border:'1px solid rgba(45,38,69,0.8)'}}/>
                {lugaQ && (
                  <button onClick={() => setLugaQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                    <X weight="bold" size={13}/>
                  </button>
                )}
              </div>
              <div className="flex gap-1 p-1 rounded-2xl"
                style={{background:'rgba(19,17,28,0.8)', border:'1px solid rgba(45,38,69,0.6)'}}>
                {(['all','Movie','Series'] as const).map(v => (
                  <button key={v} onClick={() => setLugaType(v)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: lugaType===v ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                      color: lugaType===v ? '#fff' : '#7C7A91',
                    }}>
                    {v==='all'?'All':v}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            {lugaReady && (
              <p className="text-xs text-muted">
                <span className="text-white font-bold">{filteredLuga.length.toLocaleString()}</span> titles
              </p>
            )}

            {/* Loading */}
            {!lugaReady && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {Array.from({length:18}).map((_,i) => <Skel key={i}/>)}
              </div>
            )}

            {/* Error */}
            {lugaReady && lugaError && (
              <div className="text-center py-16 space-y-3">
                <Translate weight="duotone" size={40} className="text-muted opacity-40 mx-auto"/>
                <p className="text-white font-bold">Couldn't load translated movies</p>
                <button onClick={() => window.location.reload()}
                  className="btn-primary px-5 py-2 rounded-xl text-sm font-bold text-white">↺ Retry</button>
              </div>
            )}

            {/* Grid */}
            {lugaReady && !lugaError && lugaAll.length > 0 && (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                  {visibleLuga.map(m => (
                    <LugaCard key={m.id} m={m} onClick={() => navigate(lugaPath(m))}/>
                  ))}
                </div>
                <div ref={loaderRef} className="py-4 flex justify-center">
                  {visibleLuga.length < filteredLuga.length && (
                    <SpinnerGap weight="bold" size={20} className="text-muted animate-spin"/>
                  )}
                </div>
                {filteredLuga.length === 0 && (
                  <div className="text-center py-16">
                    <Translate weight="duotone" size={40} className="text-muted opacity-40 mx-auto mb-3"/>
                    <p className="text-muted">No results for "{lugaQ}"</p>
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

/* ── TMDB Card ── */
function TMDBCard({ m, onClick }: { m: TM; onClick: () => void }) {
  const [err, setErr] = useState(false)
  const title = m.title || m.name || ''
  const year  = (m.release_date || m.first_air_date || '').slice(0, 4)
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2"
        style={{background:'rgba(19,17,28,0.8)', boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
        {m.poster_path && !err
          ? <img src={`${IMG}/w342${m.poster_path}`} alt={title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setErr(true)}/>
          : <div className="w-full h-full flex items-center justify-center">
              <FilmSlate weight="duotone" size={28} className="text-muted opacity-40"/>
            </div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
          <div className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-glow-sm">
            <Play weight="fill" size={10}/>Play
          </div>
        </div>
        {(m.vote_average||0) > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
            <Star weight="fill" size={8}/>{m.vote_average.toFixed(1)}
          </div>
        )}
        {(m.media_type === 'tv' || m.name) && !m.title && (
          <div className="absolute top-2 left-2 bg-cyan-500/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">TV</div>
        )}
      </div>
      <p className="text-[12px] font-bold text-white truncate tracking-tight">{title}</p>
      <p className="text-[10px] text-muted mt-0.5">{year||'—'}</p>
    </div>
  )
}

/* ── Luga Card ── */
function LugaCard({ m, onClick }: { m: LM; onClick: () => void }) {
  const [err, setErr] = useState(false)
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2"
        style={{background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(19,17,28,0.9))', boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
        {m.p && !err
          ? <img src={m.p} alt={m.t} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setErr(true)}/>
          : <div className="w-full h-full flex items-center justify-center">
              <Microphone weight="duotone" size={28} className="text-primary-light opacity-40"/>
            </div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
          <div className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-glow-sm">
            <Play weight="fill" size={10}/>Watch
          </div>
        </div>
        <div className="absolute top-2 left-2 text-[8px] font-black px-1.5 py-0.5 rounded-md text-white"
          style={{background: m.tp==='Series' ? 'rgba(16,185,129,0.85)' : 'rgba(124,58,237,0.85)'}}>
          {m.tp==='Series'?'SERIES':'MOVIE'}
        </div>
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)'}}>
          <Translate weight="bold" size={10} className="text-primary-light"/>
        </div>
      </div>
      <p className="text-[12px] font-bold text-white truncate tracking-tight">{m.t}</p>
      <p className="text-[9px] text-muted mt-0.5 truncate">{normaliseVj(m.v)}</p>
    </div>
  )
}

function Skel() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-2xl skeleton mb-2"/>
      <div className="h-3 skeleton rounded w-3/4 mb-1.5"/>
      <div className="h-2.5 skeleton rounded w-1/2"/>
    </div>
  )
}

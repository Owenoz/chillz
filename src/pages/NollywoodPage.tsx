import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilmSlate, Play, MagnifyingGlass, X, Globe } from '@phosphor-icons/react'

interface AfricaMovie {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  original_language: string
  media_type?: string
}

type Region = 'nollywood' | 'swahili' | 'east_africa' | 'ghana' | 'south_africa'

const REGIONS: { key: Region; label: string; flag: string; color: string; params: Record<string,string> }[] = [
  { key:'nollywood',   label:'Nollywood',      flag:'🇳🇬', color:'#16a34a', params:{ with_original_language:'yo|ig|ha', region:'NG', sort_by:'popularity.desc' } },
  { key:'swahili',     label:'Swahili / Bongo', flag:'🇹🇿', color:'#ca8a04', params:{ with_original_language:'sw', sort_by:'popularity.desc' } },
  { key:'east_africa', label:'East Africa',     flag:'🇰🇪', color:'#dc2626', params:{ region:'KE,UG,TZ', sort_by:'popularity.desc' } },
  { key:'ghana',       label:'Ghanaian',        flag:'🇬🇭', color:'#92400e', params:{ region:'GH', sort_by:'popularity.desc' } },
  { key:'south_africa',label:'South Africa',    flag:'🇿🇦', color:'#1d4ed8', params:{ region:'ZA', with_original_language:'af|zu|xh|st', sort_by:'popularity.desc' } },
]

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMDUxNTkyM2M2MzgxZDc2NDNkODk0OTk3OTZiZmFmMCIsIm5iZiI6MTY5NDg3MzY4OC4wMzMsInN1YiI6IjY1MDViODU4Mzk0YTg3MDExYzljYWQxZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.QRNylr5k3CEf1L0KBcpHUrht_6I966N0ZqCO5jbRLy8'
const IMG = 'https://image.tmdb.org/t/p'

async function fetchRegion(params: Record<string,string>): Promise<AfricaMovie[]> {
  const p = new URLSearchParams({ ...params, page: '1' })
  try {
    const r = await fetch(`https://api.themoviedb.org/3/discover/movie?${p}`, {
      headers: { Authorization: `Bearer ${TMDB_TOKEN}`, Accept: 'application/json' }
    })
    if (!r.ok) return []
    const d = await r.json()
    return d.results ?? []
  } catch { return [] }
}

function moviePath(m: AfricaMovie) {
  const title  = encodeURIComponent(m.title || m.name || '')
  const poster = encodeURIComponent(m.poster_path ? `${IMG}/w500${m.poster_path}` : '')
  const year   = (m.release_date || m.first_air_date || '').slice(0,4)
  const rating = m.vote_average?.toFixed(1) || ''
  const plot   = encodeURIComponent((m.overview||'').slice(0,200))
  return `/movies/tmdb/${m.id}?type=movie&title=${title}&poster=${poster}&year=${year}&rating=${rating}&plot=${plot}`
}

export default function NollywoodPage() {
  const navigate = useNavigate()
  const [activeRegion, setActiveRegion] = useState<Region>('nollywood')
  const [rails, setRails]   = useState<Partial<Record<Region, AfricaMovie[]>>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchRes, setSearchRes] = useState<AfricaMovie[]>([])
  const [searching, setSearching] = useState(false)
  const stTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setLoading(true)
    const r = REGIONS.find(r => r.key === activeRegion)!
    fetchRegion(r.params).then(movies => {
      setRails(prev => ({ ...prev, [activeRegion]: movies }))
      setLoading(false)
    })
  }, [activeRegion])

  useEffect(() => {
    clearTimeout(stTimer.current)
    if (!search.trim()) { setSearchRes([]); return }
    stTimer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(search)}&page=1`,
          { headers: { Authorization: `Bearer ${TMDB_TOKEN}`, Accept: 'application/json' } }
        )
        const d = await r.json()
        setSearchRes(d.results ?? [])
      } catch { /* silent */ }
      setSearching(false)
    }, 450)
    return () => clearTimeout(stTimer.current)
  }, [search])

  const activeR = REGIONS.find(r => r.key === activeRegion)!
  const movies  = rails[activeRegion] ?? []
  const hero    = movies[0]

  return (
    <div className="bg-mesh min-h-screen pb-6">

      {/* Hero */}
      {!search && hero && (
        <div className="relative overflow-hidden cursor-pointer group"
          style={{ aspectRatio:'21/9', minHeight:200, maxHeight:400 }}
          onClick={() => navigate(moviePath(hero))}>
          {hero.backdrop_path && (
            <img src={`${IMG}/w1280${hero.backdrop_path}`} alt={hero.title||''}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={e=>((e.currentTarget as HTMLImageElement).style.display='none')}/>
          )}
          <div className="absolute inset-0" style={{background:'linear-gradient(to right,rgba(10,10,15,0.96) 0%,rgba(10,10,15,0.55) 55%,rgba(10,10,15,0.1) 100%)'}}/>
          <div className="absolute inset-0" style={{background:'linear-gradient(to top,#0A0A0F 0%,transparent 55%)'}}/>
          <div className="absolute inset-0 flex items-end px-6 pb-7">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{activeR.flag}</span>
                <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ background:`${activeR.color}25`, border:`1px solid ${activeR.color}50`, color: activeR.color }}>
                  {activeR.label}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-none tracking-tight mb-3">{hero.title||hero.name}</h2>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background:`linear-gradient(135deg,${activeR.color},${activeR.color}bb)`, boxShadow:`0 8px 24px ${activeR.color}40` }}>
                <Play weight="fill" size={14}/> Watch Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-5 space-y-6 pt-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Globe weight="duotone" size={22} className="text-primary-light"/> Africa & Nollywood
          </h1>
          <p className="text-muted text-sm mt-0.5">Nigerian · Swahili · East African · Ghanaian cinema</p>
        </div>

        {/* Region tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {REGIONS.map(r => (
            <button key={r.key} onClick={() => setActiveRegion(r.key)}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                background: activeRegion===r.key ? `${r.color}25` : 'rgba(19,17,28,0.7)',
                border: `1px solid ${activeRegion===r.key ? r.color+'60' : 'rgba(45,38,69,0.6)'}`,
                color: activeRegion===r.key ? r.color : '#7C7A91',
                boxShadow: activeRegion===r.key ? `0 4px 12px ${r.color}30` : 'none',
              }}>
              {r.flag} {r.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlass weight="bold" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"/>
          <input type="text" placeholder="Search African movies…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-muted focus:outline-none"
            style={{ background:'rgba(19,17,28,0.8)', border:'1px solid rgba(45,38,69,0.8)' }}/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"><X weight="bold" size={14}/></button>}
        </div>

        {/* Search results */}
        {search.trim() && (
          <div>
            <p className="text-sm text-muted mb-4">{searching ? 'Searching…' : `${searchRes.length} results`}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {searchRes.map(m => <MovieCard key={m.id} m={m} color={activeR.color} onClick={()=>navigate(moviePath(m))}/>)}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && !search && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array.from({length:12}).map((_,i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-2xl skeleton mb-2"/>
                <div className="h-3 skeleton rounded w-3/4 mb-1.5"/>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && !search && movies.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span className="text-xl">{activeR.flag}</span> {activeR.label} Movies
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {movies.map(m => (
                <MovieCard key={m.id} m={m} color={activeR.color} onClick={()=>navigate(moviePath(m))}/>
              ))}
            </div>
          </>
        )}

        {!loading && !search && movies.length === 0 && (
          <div className="text-center py-16">
            <FilmSlate weight="duotone" size={40} className="text-muted opacity-40 mx-auto mb-3"/>
            <p className="text-muted">No movies found for this region</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MovieCard({ m, color, onClick }: { m: AfricaMovie; color: string; onClick: () => void }) {
  const [err, setErr] = useState(false)
  const title = m.title || m.name || ''
  const year  = (m.release_date || m.first_air_date || '').slice(0,4)
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2"
        style={{ background:`linear-gradient(135deg,${color}20,rgba(19,17,28,0.9))`, boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
        {m.poster_path && !err
          ? <img src={`${IMG}/w342${m.poster_path}`} alt={title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={()=>setErr(true)}/>
          : <div className="w-full h-full flex items-center justify-center"><FilmSlate weight="duotone" size={28} className="text-muted opacity-40"/></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
          <div className="flex items-center gap-1.5 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg"
            style={{ background: color }}>
            <Play weight="fill" size={10}/> Watch
          </div>
        </div>
      </div>
      <p className="text-[12px] font-bold text-white truncate tracking-tight">{title}</p>
      <p className="text-[10px] text-muted mt-0.5">{year || '—'}</p>
    </div>
  )
}

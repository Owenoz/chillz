import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Translate, Play, MagnifyingGlass, X,
  Funnel, ArrowRight, Microphone,
} from '@phosphor-icons/react'
import moviesData from '../data/translated_movies.json'

interface TranslatedMovie {
  id: string
  title: string
  vj: string
  genre: string[]
  year: number
  language: string
  description: string
  poster_url: string
  source_url: string
  source_site: string
  embed_url: string
  category: string
}

const movies = moviesData as TranslatedMovie[]

const ALL_VJS = ['All', ...Array.from(new Set(movies.map(m => m.vj))).sort()]
const ALL_GENRES = ['All', 'Action', 'Drama', 'Thriller', 'Comedy', 'Horror', 'Sci-Fi', 'Romance']
const ALL_SOURCES = ['All', ...Array.from(new Set(movies.map(m => m.source_site))).sort()]

const VJ_COLORS: Record<string, string> = {
  'VJ Junior': '#8B5CF6',
  'VJ Ice P':  '#3B82F6',
  'VJ Emmy':   '#10B981',
  'VJ Muba':   '#F59E0B',
  'VJ Jingo':  '#EF4444',
  'VJ Kevo':   '#EC4899',
  'VJ Mark':   '#6366F1',
}

export default function TranslatedMoviesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedVj, setSelectedVj] = useState('All')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [selectedSource, setSelectedSource] = useState('All')

  const filtered = useMemo(() => {
    return movies.filter(m => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        m.title.toLowerCase().includes(q) ||
        m.vj.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      const matchVj = selectedVj === 'All' || m.vj === selectedVj
      const matchGenre = selectedGenre === 'All' || m.genre.includes(selectedGenre)
      const matchSource = selectedSource === 'All' || m.source_site === selectedSource
      return matchSearch && matchVj && matchGenre && matchSource
    })
  }, [search, selectedVj, selectedGenre, selectedSource])

  const isFiltering = search || selectedVj !== 'All' || selectedGenre !== 'All' || selectedSource !== 'All'

  const clearFilters = () => {
    setSearch('')
    setSelectedVj('All')
    setSelectedGenre('All')
    setSelectedSource('All')
  }

  // Group by VJ for the "browse by VJ" section
  const byVj = ALL_VJS.filter(v => v !== 'All').map(vj => ({
    vj,
    count: movies.filter(m => m.vj === vj).length,
    color: VJ_COLORS[vj] || '#8B5CF6',
    sample: movies.find(m => m.vj === vj),
  }))

  return (
    <div className="pb-24 md:pb-8">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-30"
            style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.2), transparent 60%)' }} />
          <div className="absolute top-0 right-0 w-96 h-64 opacity-20"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(236,72,153,0.3), transparent 70%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] text-primary-light uppercase bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
              <Translate weight="duotone" size={11} /> Luganda VJ
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-3">
            Translated<br />
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #8B5CF6 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Movies</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            Ugandan VJ-translated movies and series in Luganda — VJ Junior, VJ Ice P, VJ Emmy, VJ Muba and more.
          </p>

          {/* VJ quick-select pills */}
          <div className="flex flex-wrap gap-2">
            {byVj.map(({ vj, count, color }) => (
              <button
                key={vj}
                onClick={() => setSelectedVj(selectedVj === vj ? 'All' : vj)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: selectedVj === vj ? `${color}25` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedVj === vj ? color + '60' : 'rgba(255,255,255,0.08)'}`,
                  color: selectedVj === vj ? color : '#9ca3af',
                }}
              >
                <Microphone weight="duotone" size={11} style={{ color }} />
                {vj}
                <span className="text-[9px] opacity-60 font-semibold">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Search + filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlass weight="bold" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search movies, VJs…"
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

          {/* Genre */}
          <div className="relative">
            <Funnel weight="duotone" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10" />
            <select
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
              className="bg-surface border border-border rounded-xl pl-8 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60 appearance-none cursor-pointer"
            >
              {ALL_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Source */}
          <div className="relative">
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60 appearance-none cursor-pointer"
            >
              {ALL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Results bar */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">
            <span className="text-white font-semibold">{filtered.length}</span> movies
            {selectedVj !== 'All' && <span className="ml-1 text-primary-light">· {selectedVj}</span>}
          </p>
          {isFiltering && (
            <button onClick={clearFilters} className="text-xs text-gray-600 hover:text-white flex items-center gap-1 transition-colors">
              <X weight="bold" size={11} /> Clear
            </button>
          )}
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Translate weight="duotone" size={40} className="text-gray-700 mx-auto" />
            <p className="text-gray-600 font-medium">No movies found</p>
            <button onClick={clearFilters} className="text-primary-light text-sm hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => navigate(`/translated/${movie.id}`)}
              />
            ))}
          </div>
        )}

        {/* ── Source sites banner ── */}
        <div className="rounded-2xl border border-white/6 p-6 space-y-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(10,14,26,0.8))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
          <div className="flex items-center gap-2">
            <Translate weight="duotone" size={16} className="text-primary-light" />
            <h3 className="text-sm font-bold text-white">Powered by Ugandan VJ Sites</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Content is served from established Ugandan VJ movie platforms. Click any movie to watch on the source site.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'UgaFlix', url: 'https://ugaflix.com' },
              { name: 'UGMovieBox', url: 'https://www.ugmoviebox.com' },
              { name: 'FlixOn', url: 'https://www.flixon.net' },
              { name: 'VJStream', url: 'https://vjstream.online' },
              { name: 'MunnoUG', url: 'https://munnoug.com' },
              { name: 'UnrulyMovies', url: 'https://unrulymovies.com' },
              { name: 'MoviesUG', url: 'https://movies.ug' },
              { name: 'KStream', url: 'https://stream.kit.africa' },
            ].map(({ name, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white bg-white/4 border border-white/6 hover:border-white/14 px-3 py-1.5 rounded-full transition-all"
              >
                {name} <ArrowRight size={10} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Movie Card ─────────────────────────────────────────── */
function MovieCard({ movie, onClick }: { movie: TranslatedMovie; onClick: () => void }) {
  const vjColor = VJ_COLORS[movie.vj] || '#8B5CF6'

  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-2 mb-2">
        <img
          src={movie.poster_url}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-end p-3 gap-2">
          <div className="self-center flex items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg">
            <Play weight="fill" size={10} /> Watch
          </div>
        </div>
        {/* VJ badge */}
        <div
          className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider"
          style={{ background: `${vjColor}30`, border: `1px solid ${vjColor}50`, color: vjColor }}
        >
          {movie.vj}
        </div>
        {/* Source badge */}
        <div className="absolute bottom-2 right-2 text-[8px] font-semibold text-gray-400 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
          {movie.source_site}
        </div>
      </div>
      <p className="text-[12px] font-semibold text-white truncate tracking-tight">{movie.title}</p>
      <p className="text-[10px] text-gray-600 mt-0.5 flex items-center gap-1.5">
        <span>{movie.year}</span>
        <span className="text-gray-700">·</span>
        <span className="truncate">{movie.genre[0]}</span>
      </p>
    </div>
  )
}

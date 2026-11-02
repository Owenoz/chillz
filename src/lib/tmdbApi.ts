// TMDB API — non-translated movies
const TMDB_BASE  = 'https://api.themoviedb.org/3'
const TMDB_IMG   = 'https://image.tmdb.org/t/p'
const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMDUxNTkyM2M2MzgxZDc2NDNkODk0OTk3OTZiZmFmMCIsIm5iZiI6MTY5NDg3MzY4OC4wMzMsInN1YiI6IjY1MDViODU4Mzk0YTg3MDExYzljYWQxZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.QRNylr5k3CEf1L0KBcpHUrht_6I966N0ZqCO5jbRLy8'

const HEADERS = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  Accept: 'application/json',
}

export interface TMDBMovie {
  id: number
  title: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  first_air_date?: string
  vote_average: number
  genre_ids: number[]
  media_type?: string
}

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${TMDB_BASE}/${endpoint}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  try {
    const res = await fetch(url.toString(), { headers: HEADERS })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export function tmdbImage(path: string | null | undefined, size = 'w500'): string {
  if (!path) return ''
  return `${TMDB_IMG}/${size}${path}`
}

export interface TMDBRail {
  key: string
  label: string
  fetch: () => Promise<TMDBMovie[]>
}

async function getMovies(endpoint: string, params: Record<string, string> = {}): Promise<TMDBMovie[]> {
  const data = await tmdbFetch(endpoint, { page: '1', ...params })
  return data?.results ?? []
}

export const TMDB_RAILS: TMDBRail[] = [
  { key: 'nowPlaying',  label: 'Now Playing',    fetch: () => getMovies('movie/now_playing') },
  { key: 'trending',    label: 'Trending',        fetch: () => getMovies('trending/movie/week') },
  { key: 'popular',     label: 'Popular',         fetch: () => getMovies('movie/popular') },
  { key: 'topRated',    label: 'Top Rated',       fetch: () => getMovies('movie/top_rated') },
  { key: 'upcoming',    label: 'Upcoming',        fetch: () => getMovies('movie/upcoming') },
  { key: 'action',      label: 'Action',          fetch: () => getMovies('discover/movie', { with_genres: '28', sort_by: 'popularity.desc' }) },
  { key: 'drama',       label: 'Drama',           fetch: () => getMovies('discover/movie', { with_genres: '18', sort_by: 'popularity.desc' }) },
  { key: 'comedy',      label: 'Comedy',          fetch: () => getMovies('discover/movie', { with_genres: '35', sort_by: 'popularity.desc' }) },
  { key: 'thriller',    label: 'Thriller',        fetch: () => getMovies('discover/movie', { with_genres: '53', sort_by: 'popularity.desc' }) },
  { key: 'horror',      label: 'Horror',          fetch: () => getMovies('discover/movie', { with_genres: '27', sort_by: 'popularity.desc' }) },
  { key: 'scifi',       label: 'Sci-Fi',          fetch: () => getMovies('discover/movie', { with_genres: '878', sort_by: 'popularity.desc' }) },
  { key: 'tvShows',     label: 'TV Shows',        fetch: () => getMovies('tv/popular') },
]

export async function searchTMDB(query: string): Promise<TMDBMovie[]> {
  const data = await tmdbFetch('search/multi', { query, page: '1' })
  return (data?.results ?? []).filter((r: TMDBMovie) =>
    r.media_type === 'movie' || r.media_type === 'tv' || r.title || r.name
  )
}

// Build vidsrc.to embed URL from TMDB movie id
export function buildVidsrcUrl(id: number, mediaType: 'movie' | 'tv' = 'movie', season = 1, episode = 1): string {
  if (mediaType === 'tv') return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
  return `https://vidsrc.to/embed/movie/${id}`
}

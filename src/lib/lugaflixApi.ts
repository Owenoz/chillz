// LugaFlix API — 54,810 VJ-translated movies with direct MP4 CDN URLs
// Source: movies.mruodel.com/api/movies

export interface LugaMovie {
  id: number
  title: string
  url: string          // Direct MP4 CDN URL — plays in <video> tag
  thumbnail_url: string
  description: string | null
  year: string | null
  rating: string | null
  genre: string | null
  type: 'Movie' | 'Series'
  category: string
  actor: string
  vj: string
  is_premium: 'Yes' | 'No'
  views_count: number
  likes_count: number
}

const API = 'https://movies.mruodel.com/api/movies'

interface LugaResponse {
  code: number
  status: number
  data: {
    items: LugaMovie[]
    pagination: { current_page: number; per_page: number; total: number; last_page: number }
  }
}

export async function getLugaMovies(page = 1, perPage = 40): Promise<LugaResponse> {
  const res = await fetch(`${API}?page=${page}&per_page=${perPage}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!res.ok) throw new Error(`LugaFlix error ${res.status}`)
  return res.json()
}

export async function searchLuga(query: string, page = 1): Promise<LugaMovie[]> {
  // API has no search endpoint — fetch a larger page and filter
  const data = await getLugaMovies(page, 100)
  const q = query.toLowerCase()
  return data.data.items.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.vj.toLowerCase().includes(q) ||
    (m.genre ?? '').toLowerCase().includes(q)
  )
}

// Normalise VJ name: "Vj Little T" → "VJ Little T"
export function normaliseVj(raw: string): string {
  return raw.replace(/^vj\s*/i, 'VJ ').trim()
}

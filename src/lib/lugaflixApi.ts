// LugaFlix API — 54,810 VJ-translated movies with direct MP4 CDN URLs
// Source: movies.mruodel.com/api/movies
// CORS proxy: /api/luga (Vercel serverless function)

export interface LugaMovie {
  id: number
  title: string
  url: string
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

interface LugaResponse {
  code: number
  status: number
  data: {
    items: LugaMovie[]
    pagination: { current_page: number; per_page: number; total: number; last_page: number }
  }
}

// Use our Vercel proxy to avoid CORS — falls back to direct if proxy unavailable
async function lugaFetch(page = 1, perPage = 40): Promise<LugaResponse> {
  // Try Vercel proxy first
  try {
    const res = await fetch(`/api/luga?page=${page}&per_page=${perPage}`)
    if (res.ok) return res.json()
  } catch { /* fallback below */ }

  // Direct call (works if server has no CORS restriction)
  const res = await fetch(`https://movies.mruodel.com/api/movies?page=${page}&per_page=${perPage}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!res.ok) throw new Error(`LugaFlix error ${res.status}`)
  return res.json()
}

export async function getLugaMovies(page = 1, perPage = 40): Promise<LugaResponse> {
  return lugaFetch(page, perPage)
}

export async function searchLuga(query: string): Promise<LugaMovie[]> {
  // Try multiple pages and filter
  try {
    const data = await lugaFetch(1, 100)
    const q = query.toLowerCase()
    return data.data.items.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.vj.toLowerCase().includes(q) ||
      (m.genre ?? '').toLowerCase().includes(q)
    )
  } catch { return [] }
}

export function normaliseVj(raw: string): string {
  return raw.replace(/^vj\s*/i, 'VJ ').trim()
}

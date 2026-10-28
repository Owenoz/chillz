export interface IAMovie {
  identifier: string
  title: string
  year: number | string
  description: string
  subject: string | string[]
  thumb?: string
  genre?: string
}

const BASE = 'https://archive.org'

export interface IARail {
  key: string
  label: string
  query: string
}

export const IA_RAILS: IARail[] = [
  {
    key: 'popular',
    label: 'Most Watched',
    query: 'mediatype:movies collection:feature_films&sort[]=downloads+desc',
  },
  {
    key: 'action',
    label: 'Action & Adventure',
    query: 'mediatype:movies collection:feature_films subject:(action OR adventure)&sort[]=downloads+desc',
  },
  {
    key: 'drama',
    label: 'Drama',
    query: 'mediatype:movies collection:feature_films subject:(drama)&sort[]=downloads+desc',
  },
  {
    key: 'comedy',
    label: 'Comedy',
    query: 'mediatype:movies collection:feature_films subject:(comedy)&sort[]=downloads+desc',
  },
  {
    key: 'thriller',
    label: 'Thriller & Mystery',
    query: 'mediatype:movies collection:feature_films subject:(thriller OR mystery OR crime)&sort[]=downloads+desc',
  },
  {
    key: 'scifi',
    label: 'Sci-Fi & Horror',
    query: 'mediatype:movies collection:feature_films subject:(science+fiction OR horror)&sort[]=downloads+desc',
  },
  {
    key: 'classic',
    label: 'Classic Cinema',
    query: 'mediatype:movies collection:feature_films year:[1940+TO+1970]&sort[]=downloads+desc',
  },
  {
    key: 'western',
    label: 'Western',
    query: 'mediatype:movies collection:feature_films subject:(western)&sort[]=downloads+desc',
  },
  {
    key: 'romance',
    label: 'Romance',
    query: 'mediatype:movies collection:feature_films subject:(romance OR romantic)&sort[]=downloads+desc',
  },
  {
    key: 'documentary',
    label: 'Documentary',
    query: 'mediatype:movies collection:feature_films subject:(documentary)&sort[]=downloads+desc',
  },
]

export async function fetchIARail(query: string, rows = 24, start = 0): Promise<IAMovie[]> {
  const url =
    `${BASE}/advancedsearch.php?q=${query}` +
    `&fl[]=identifier,title,year,description,subject` +
    `&rows=${rows}&start=${start}&output=json`

  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    const docs: IAMovie[] = (data?.response?.docs ?? [])
    return docs.map(normalise)
  } catch {
    return []
  }
}

export async function searchIA(query: string, rows = 20): Promise<IAMovie[]> {
  const q = encodeURIComponent(`mediatype:movies collection:feature_films ${query}`)
  const url =
    `${BASE}/advancedsearch.php?q=${q}` +
    `&fl[]=identifier,title,year,description,subject` +
    `&rows=${rows}&sort[]=downloads+desc&output=json`

  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return (data?.response?.docs ?? []).map(normalise)
  } catch {
    return []
  }
}

function normalise(doc: IAMovie): IAMovie {
  return {
    ...doc,
    title: doc.title || 'Unknown Title',
    year: doc.year || 0,
    description: Array.isArray(doc.description)
      ? (doc.description as unknown as string[])[0] || ''
      : doc.description || '',
    subject: doc.subject || [],
    thumb: `${BASE}/services/img/${doc.identifier}`,
  }
}

export function embedUrl(identifier: string): string {
  return `${BASE}/embed/${identifier}`
}

export function detailUrl(identifier: string): string {
  return `${BASE}/details/${identifier}`
}

export function genres(movie: IAMovie): string[] {
  const sub = Array.isArray(movie.subject)
    ? (movie.subject as string[])
    : [movie.subject as string]
  return sub
    .filter(s => typeof s === 'string' && s.length < 30)
    .slice(0, 3)
}

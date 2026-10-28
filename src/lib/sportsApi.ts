import type { Fixture } from '../data/types'

const BASE = 'https://www.thesportsdb.com/api/v1/json/123'

const LEAGUES = [
  { id: 4328, name: 'English Premier League' },
  { id: 4335, name: 'Spanish La Liga' },
  { id: 4332, name: 'Italian Serie A' },
  { id: 4334, name: 'French Ligue 1' },
  { id: 4331, name: 'German Bundesliga' },
  { id: 4480, name: 'UEFA Champions League' },
  { id: 4399, name: 'Dutch Eredivisie' },
  { id: 4418, name: 'Portuguese Primeira Liga' },
  { id: 4346, name: 'Scottish Premiership' },
  { id: 4351, name: 'Brazilian Série A' },
]

interface SDBEvent {
  idEvent: string
  strLeague: string
  strHomeTeam: string
  strAwayTeam: string
  strHomeTeamBadge?: string
  strAwayTeamBadge?: string
  dateEvent: string
  strTime?: string
  strTimestamp?: string
  intHomeScore?: string | null
  intAwayScore?: string | null
  strStatus?: string
  strVenue?: string
  strRound?: string
  intRound?: string
  strThumb?: string
}

// Fetch with a hard timeout so a slow response doesn't stall everything
async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

function mapStatus(e: SDBEvent): Fixture['status'] {
  const s = (e.strStatus || '').toUpperCase().trim()
  if (['1H', 'HT', '2H', 'ET', 'LIVE', 'IN PLAY', 'INPLAY'].includes(s)) return 'IN_PLAY'
  if (['FT', 'AET', 'PEN', 'FINISHED', 'POST'].includes(s)) return 'FINISHED'
  if (['CANC', 'CANCELLED', 'ABD', 'ABANDONED'].includes(s)) return 'CANCELLED'
  return 'SCHEDULED'
}

function mapWinner(e: SDBEvent): Fixture['winner'] {
  const h = e.intHomeScore != null && e.intHomeScore !== '' ? Number(e.intHomeScore) : null
  const a = e.intAwayScore != null && e.intAwayScore !== '' ? Number(e.intAwayScore) : null
  if (h == null || a == null) return null
  if (h > a) return 'HOME_TEAM'
  if (a > h) return 'AWAY_TEAM'
  return 'DRAW'
}

function toFixture(e: SDBEvent, leagueId: number): Fixture {
  const date = e.strTimestamp
    ? new Date(e.strTimestamp).toISOString()
    : `${e.dateEvent}T${e.strTime || '00:00:00'}+00:00`

  return {
    id: Number(e.idEvent),
    competition_id: leagueId,
    competition_name: e.strLeague,
    matchday: Number(e.intRound) || 0,
    utc_date: date,
    status: mapStatus(e),
    home_team_id: 0,
    home_team_name: e.strHomeTeam,
    home_team_crest: e.strHomeTeamBadge || '',
    away_team_id: 0,
    away_team_name: e.strAwayTeam,
    away_team_crest: e.strAwayTeamBadge || '',
    home_score: e.intHomeScore != null && e.intHomeScore !== '' ? Number(e.intHomeScore) : null,
    away_score: e.intAwayScore != null && e.intAwayScore !== '' ? Number(e.intAwayScore) : null,
    winner: mapWinner(e),
    enabled: true,
    is_match_of_day: false,
    is_trending: false,
    venue: e.strVenue || null,
    city: null,
    stage: e.strRound || null,
  }
}

async function fetchLeague(leagueId: number): Promise<Fixture[]> {
  const fixtures: Fixture[] = []

  // Fetch next + past sequentially (not parallel) to reduce load
  try {
    const res = await fetchWithTimeout(`${BASE}/eventsnextleague.php?id=${leagueId}`)
    if (res.ok) {
      const data = await res.json()
      const events: SDBEvent[] = data?.events || []
      events.forEach(e => fixtures.push(toFixture(e, leagueId)))
    }
  } catch { /* timeout or network error — skip this endpoint */ }

  try {
    const res = await fetchWithTimeout(`${BASE}/eventspastleague.php?id=${leagueId}`)
    if (res.ok) {
      const data = await res.json()
      const events: SDBEvent[] = data?.events || []
      events.forEach(e => fixtures.push(toFixture(e, leagueId)))
    }
  } catch { /* skip */ }

  return fixtures
}

export async function fetchLiveFixtures(): Promise<Fixture[]> {
  // Fetch leagues in small parallel batches to avoid overwhelming the API
  const BATCH = 3
  const all: Fixture[] = []

  for (let i = 0; i < LEAGUES.length; i += BATCH) {
    const batch = LEAGUES.slice(i, i + BATCH)
    const results = await Promise.allSettled(batch.map(l => fetchLeague(l.id)))
    results.forEach(r => {
      if (r.status === 'fulfilled') all.push(...r.value)
    })
  }

  // Deduplicate by id
  const seen = new Set<number>()
  const unique = all.filter(f => {
    if (seen.has(f.id)) return false
    seen.add(f.id)
    return true
  })

  return unique
}

export async function fetchFixtureById(id: number): Promise<Fixture | null> {
  try {
    const res = await fetchWithTimeout(`${BASE}/lookupevent.php?id=${id}`)
    if (!res.ok) return null
    const data = await res.json()
    const events: SDBEvent[] = data?.events || []
    if (!events.length) return null
    const e = events[0]
    const league = LEAGUES.find(l => l.name === e.strLeague) || LEAGUES[0]
    return toFixture(e, league.id)
  } catch {
    return null
  }
}

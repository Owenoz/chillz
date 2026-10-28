import type { Fixture } from '../data/types'

const BASE = 'https://www.thesportsdb.com/api/v1/json/123'

// Major leagues to fetch
const LEAGUES = [
  { id: 4328, name: 'Premier League' },
  { id: 4335, name: 'La Liga' },
  { id: 4332, name: 'Serie A' },
  { id: 4334, name: 'Ligue 1' },
  { id: 4331, name: 'Bundesliga' },
  { id: 4480, name: 'Champions League' },
  { id: 4399, name: 'Eredivisie' },
  { id: 4418, name: 'Primeira Liga' },
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
}

function mapStatus(e: SDBEvent): Fixture['status'] {
  const s = (e.strStatus || '').toUpperCase()
  if (['1H', 'HT', '2H', 'ET', 'LIVE', 'IN PLAY'].includes(s)) return 'IN_PLAY'
  if (['FT', 'AET', 'PEN', 'FINISHED'].includes(s)) return 'FINISHED'
  if (s === 'CANCELLED') return 'CANCELLED'
  return 'SCHEDULED'
}

function mapWinner(e: SDBEvent): Fixture['winner'] {
  const h = e.intHomeScore != null ? Number(e.intHomeScore) : null
  const a = e.intAwayScore != null ? Number(e.intAwayScore) : null
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
  const [nextRes, pastRes] = await Promise.allSettled([
    fetch(`${BASE}/eventsnextleague.php?id=${leagueId}`),
    fetch(`${BASE}/eventspastleague.php?id=${leagueId}`),
  ])

  const fixtures: Fixture[] = []

  if (nextRes.status === 'fulfilled' && nextRes.value.ok) {
    const data = await nextRes.value.json()
    const events: SDBEvent[] = data?.events || []
    events.forEach(e => fixtures.push(toFixture(e, leagueId)))
  }

  if (pastRes.status === 'fulfilled' && pastRes.value.ok) {
    const data = await pastRes.value.json()
    const events: SDBEvent[] = data?.events || []
    events.forEach(e => fixtures.push(toFixture(e, leagueId)))
  }

  return fixtures
}

export async function fetchLiveFixtures(): Promise<Fixture[]> {
  // Fetch all leagues in parallel
  const results = await Promise.allSettled(
    LEAGUES.map(l => fetchLeague(l.id))
  )

  const all: Fixture[] = []
  results.forEach(r => {
    if (r.status === 'fulfilled') all.push(...r.value)
  })

  // Deduplicate by id
  const seen = new Set<number>()
  return all.filter(f => {
    if (seen.has(f.id)) return false
    seen.add(f.id)
    return true
  })
}

export async function fetchFixtureById(id: number): Promise<Fixture | null> {
  try {
    const res = await fetch(`${BASE}/lookupevent.php?id=${id}`)
    if (!res.ok) return null
    const data = await res.json()
    const events: SDBEvent[] = data?.events || []
    if (!events.length) return null
    const e = events[0]
    // find league id from our list
    const league = LEAGUES.find(l => l.name === e.strLeague) || LEAGUES[0]
    return toFixture(e, league.id)
  } catch {
    return null
  }
}

import type { Fixture } from '../data/types'

const SUPABASE_URL = 'https://sykjlkbifrkmvlikyilv.supabase.co'
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5a2psa2JpZnJrbXZsaWt5aWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMzM2MDgsImV4cCI6MjEwNzYwOTYwOH0.o2_Xrr64RX4sjeZz_k4bHQCmaSzv9S8iEArg05jKYEg'

const HEADERS = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
}

const FIELDS = [
  'id', 'competition_id', 'competition_name', 'matchday', 'utc_date', 'status',
  'home_team_id', 'home_team_name', 'home_team_crest',
  'away_team_id', 'away_team_name', 'away_team_crest',
  'home_score', 'away_score', 'winner',
  'enabled', 'is_match_of_day', 'is_trending',
  'venue', 'city', 'stage',
].join(',')

export async function fetchLiveFixtures(): Promise<Fixture[]> {
  const url =
    `${SUPABASE_URL}/rest/v1/fixtures` +
    `?select=${FIELDS}` +
    `&enabled=eq.true` +
    `&order=utc_date.asc` +
    `&limit=500`

  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error(`Supabase error ${res.status}`)
  const data = await res.json()
  if (!Array.isArray(data)) throw new Error('Unexpected response shape')
  return data as Fixture[]
}

export async function fetchFixtureById(id: number): Promise<Fixture | null> {
  const url =
    `${SUPABASE_URL}/rest/v1/fixtures` +
    `?select=${FIELDS}` +
    `&id=eq.${id}` +
    `&limit=1`

  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) return null
  const data = await res.json()
  return Array.isArray(data) && data.length > 0 ? (data[0] as Fixture) : null
}

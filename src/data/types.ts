export interface TvChannel {
  id: string
  title: string
  source_url: string
  source_type: 'hls' | 'iframe' | 'youtube'
  category: string
  active: boolean
  country: string | null
  display_order: number
  poster_url: string | null
  description: string | null
}

export interface Fixture {
  id: number
  competition_id: number
  competition_name: string
  matchday: number
  utc_date: string
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'CANCELLED' | string
  home_team_id: number
  home_team_name: string
  home_team_crest: string
  away_team_id: number
  away_team_name: string
  away_team_crest: string
  home_score: number | null
  away_score: number | null
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
  enabled: boolean
  is_match_of_day: boolean
  is_trending: boolean
  venue: string | null
  city: string | null
  stage: string | null
}

export interface Team {
  id: number
  name: string
  short_name: string
  tla: string
  crest: string
}

import { supabase } from './supabase'

export interface WatchlistItem {
  id: string
  user_id: string
  item_id: string
  item_type: 'movie' | 'channel' | 'fixture'
  item_title: string
  item_poster: string
  item_url: string
  added_at: string
}

// ── Watchlist ─────────────────────────────────────────────────

export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })
  if (error) return []
  return data as WatchlistItem[]
}

export async function addToWatchlist(
  userId: string,
  item: Omit<WatchlistItem, 'id' | 'user_id' | 'added_at'>
): Promise<boolean> {
  const { error } = await supabase.from('watchlist').upsert({
    user_id:     userId,
    item_id:     item.item_id,
    item_type:   item.item_type,
    item_title:  item.item_title,
    item_poster: item.item_poster,
    item_url:    item.item_url,
  }, { onConflict: 'user_id,item_id,item_type' })
  return !error
}

export async function removeFromWatchlist(
  userId: string,
  itemId: string,
  itemType: string
): Promise<boolean> {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
  return !error
}

export async function isInWatchlist(
  userId: string,
  itemId: string,
  itemType: string
): Promise<boolean> {
  const { data } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .maybeSingle()
  return !!data
}

// ── Continue Watching (localStorage — no auth needed) ─────────

export interface ContinueItem {
  item_id: string
  item_type: 'movie' | 'channel' | 'tv_series'
  item_title: string
  item_poster: string
  item_url: string
  // For TV series
  season?: number
  episode?: number
  // Timestamp in seconds for movies
  progress?: number
  watched_at: number  // epoch ms
}

const CW_KEY = 'chillz_continue_watching'
const CW_MAX = 12

export function getContinueWatching(): ContinueItem[] {
  try {
    const raw = localStorage.getItem(CW_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ContinueItem[]
  } catch { return [] }
}

export function saveContinueWatching(item: Omit<ContinueItem, 'watched_at'>) {
  try {
    const existing = getContinueWatching()
    // Remove old entry for same item
    const filtered = existing.filter(
      i => !(i.item_id === item.item_id && i.item_type === item.item_type)
    )
    // Add to front
    const updated = [{ ...item, watched_at: Date.now() }, ...filtered].slice(0, CW_MAX)
    localStorage.setItem(CW_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }
}

export function removeContinueWatching(itemId: string, itemType: string) {
  try {
    const existing = getContinueWatching()
    const updated = existing.filter(
      i => !(i.item_id === itemId && i.item_type === itemType)
    )
    localStorage.setItem(CW_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }
}

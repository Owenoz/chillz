import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookmarkSimple, Play, X, Clock,
  FilmSlate, Television, SpinnerGap,
} from '@phosphor-icons/react'
import { useAuth } from '../contexts/AuthContext'
import {
  getWatchlist, removeFromWatchlist,
  getContinueWatching, removeContinueWatching,
  type WatchlistItem, type ContinueItem,
} from '../lib/watchlist'

type Tab = 'watchlist' | 'continue'

export default function WatchlistPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab]             = useState<Tab>('continue')
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [continueList, setContinueList] = useState<ContinueItem[]>([])
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    // Continue watching — always from localStorage
    setContinueList(getContinueWatching())
  }, [])

  useEffect(() => {
    if (!user || tab !== 'watchlist') return
    setLoading(true)
    getWatchlist(user.id).then(data => {
      setWatchlist(data)
      setLoading(false)
    })
  }, [user, tab])

  const handleRemoveWatchlist = async (item: WatchlistItem) => {
    if (!user) return
    await removeFromWatchlist(user.id, item.item_id, item.item_type)
    setWatchlist(w => w.filter(i => i.id !== item.id))
  }

  const handleRemoveContinue = (item: ContinueItem) => {
    removeContinueWatching(item.item_id, item.item_type)
    setContinueList(getContinueWatching())
  }

  return (
    <div className="bg-mesh min-h-screen pb-24">

      {/* Header */}
      <div className="px-5 pt-8 pb-4"
        style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.12) 0%, transparent 100%)' }}>
        <h1 className="text-2xl font-black text-white tracking-tight mb-4">My Library</h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit"
          style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
          {([
            { key: 'continue',  label: 'Continue Watching', Icon: Clock },
            { key: 'watchlist', label: 'Watchlist',         Icon: BookmarkSimple },
          ] as { key: Tab; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: tab === key ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                color: tab === key ? '#fff' : '#7C7A91',
                boxShadow: tab === key ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
              }}>
              <Icon weight="duotone" size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 space-y-4">

        {/* ── Continue Watching ── */}
        {tab === 'continue' && (
          <>
            {continueList.length === 0 ? (
              <EmptyState
                icon={<Clock weight="duotone" size={44} className="text-muted opacity-40" />}
                title="Nothing yet"
                desc="Start watching something and it'll appear here automatically."
                action={{ label: 'Browse Movies', onClick: () => navigate('/movies') }}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {continueList.map(item => (
                  <ContinueCard
                    key={`${item.item_id}-${item.item_type}`}
                    item={item}
                    onPlay={() => navigate(item.item_url)}
                    onRemove={() => handleRemoveContinue(item)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Watchlist ── */}
        {tab === 'watchlist' && (
          <>
            {!user ? (
              <EmptyState
                icon={<BookmarkSimple weight="duotone" size={44} className="text-muted opacity-40" />}
                title="Sign in to save your watchlist"
                desc="Create an account to save movies, channels and more across devices."
                action={{ label: 'Sign In', onClick: () => navigate('/profile') }}
              />
            ) : loading ? (
              <div className="flex items-center justify-center py-20">
                <SpinnerGap weight="bold" size={28} className="text-primary animate-spin" />
              </div>
            ) : watchlist.length === 0 ? (
              <EmptyState
                icon={<BookmarkSimple weight="duotone" size={44} className="text-muted opacity-40" />}
                title="Your watchlist is empty"
                desc="Tap the bookmark icon on any movie or channel to save it here."
                action={{ label: 'Browse Movies', onClick: () => navigate('/movies') }}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {watchlist.map(item => (
                  <WatchlistCard
                    key={item.id}
                    item={item}
                    onPlay={() => navigate(item.item_url)}
                    onRemove={() => handleRemoveWatchlist(item)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ── Cards ── */
function ContinueCard({ item, onPlay, onRemove }: {
  item: ContinueItem; onPlay: () => void; onRemove: () => void
}) {
  const timeAgo = (ms: number) => {
    const diff = Date.now() - ms
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (d > 0) return `${d}d ago`
    if (h > 0) return `${h}h ago`
    return 'Just now'
  }

  return (
    <div className="group relative">
      <button onClick={onPlay} className="w-full text-left">
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2"
          style={{ background: 'rgba(19,17,28,0.8)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {item.item_poster ? (
            <img src={item.item_poster} alt={item.item_title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {item.item_type === 'channel'
                ? <Television weight="duotone" size={32} className="text-primary-light opacity-40" />
                : <FilmSlate weight="duotone" size={32} className="text-muted opacity-40" />}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-glow-sm"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
              <Play weight="fill" size={18} className="text-white translate-x-0.5" />
            </div>
          </div>

          {/* Type badge */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-black text-white"
            style={{ background: item.item_type === 'channel' ? 'rgba(239,68,68,0.8)' : 'rgba(124,58,237,0.8)' }}>
            {item.item_type === 'channel' ? 'LIVE' : item.item_type === 'tv_series' ? 'SERIES' : 'MOVIE'}
          </div>

          {/* Episode info */}
          {item.season && (
            <div className="absolute bottom-2 left-2 text-[9px] font-bold text-white bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-lg">
              S{item.season} E{item.episode}
            </div>
          )}
        </div>
        <p className="text-[11px] font-bold text-white truncate">{item.item_title}</p>
        <p className="text-[9px] text-muted mt-0.5">{timeAgo(item.watched_at)}</p>
      </button>

      {/* Remove */}
      <button onClick={e => { e.stopPropagation(); onRemove() }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80">
        <X weight="bold" size={11} className="text-white" />
      </button>
    </div>
  )
}

function WatchlistCard({ item, onPlay, onRemove }: {
  item: WatchlistItem; onPlay: () => void; onRemove: () => void
}) {
  return (
    <div className="group relative">
      <button onClick={onPlay} className="w-full text-left">
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2"
          style={{ background: 'rgba(19,17,28,0.8)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {item.item_poster ? (
            <img src={item.item_poster} alt={item.item_title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FilmSlate weight="duotone" size={32} className="text-muted opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-glow-sm"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
              <Play weight="fill" size={18} className="text-white translate-x-0.5" />
            </div>
          </div>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-black text-white"
            style={{ background: item.item_type === 'channel' ? 'rgba(239,68,68,0.8)' : 'rgba(124,58,237,0.8)' }}>
            {item.item_type.toUpperCase()}
          </div>
        </div>
        <p className="text-[11px] font-bold text-white truncate">{item.item_title}</p>
        <p className="text-[9px] text-muted mt-0.5">
          {new Date(item.added_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </p>
      </button>
      <button onClick={e => { e.stopPropagation(); onRemove() }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80">
        <X weight="bold" size={11} className="text-white" />
      </button>
    </div>
  )
}

function EmptyState({ icon, title, desc, action }: {
  icon: React.ReactNode; title: string; desc: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center text-center py-20 gap-4">
      {icon}
      <div>
        <p className="text-white font-black text-lg">{title}</p>
        <p className="text-muted text-sm mt-1 max-w-xs">{desc}</p>
      </div>
      {action && (
        <button onClick={action.onClick}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
          {action.label}
        </button>
      )}
    </div>
  )
}

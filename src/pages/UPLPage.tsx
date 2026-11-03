import { useState, useEffect } from 'react'
import { SoccerBall, ArrowClockwise, SpinnerGap } from '@phosphor-icons/react'
import { UPL_TEAMS } from '../data/uganda_extras'

interface ESPNEvent {
  id: string
  name: string
  date: string
  status: { type: { description: string; completed: boolean } }
  competitions: Array<{
    competitors: Array<{
      team: { displayName: string; logo: string }
      score: string
      winner?: boolean
    }>
  }>
}

interface Standing {
  team: { displayName: string; logos: Array<{ href: string }> }
  stats: Array<{ name: string; value: number }>
}

export default function UPLPage() {
  const [tab, setTab]               = useState<'fixtures'|'standings'>('fixtures')
  const [events, setEvents]         = useState<ESPNEvent[]>([])
  const [standings, setStandings]   = useState<Standing[]>([])
  const [loading, setLoading]       = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [scoreRes, standRes] = await Promise.allSettled([
        fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/uga.1/scoreboard'),
        fetch('https://site.api.espn.com/apis/v2/sports/soccer/uga.1/standings'),
      ])
      if (scoreRes.status === 'fulfilled' && scoreRes.value.ok) {
        const d = await scoreRes.value.json()
        setEvents(d.events || [])
      }
      if (standRes.status === 'fulfilled' && standRes.value.ok) {
        const d = await standRes.value.json()
        const entries = d.standings?.[0]?.entries || d.children?.[0]?.standings?.entries || []
        setStandings(entries)
      }
      setLastUpdated(new Date())
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getStat = (s: Standing, name: string) =>
    s.stats.find(x => x.name === name)?.value ?? 0

  return (
    <div className="bg-mesh min-h-screen pb-24">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.15) 0%,rgba(10,10,15,1) 70%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-10"
            style={{ background: 'radial-gradient(#dc2626,transparent)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-5 pt-8 pb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-sm"
                style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
                <SoccerBall weight="fill" size={26} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-red-400 uppercase mb-0.5">🇺🇬 StarTimes</p>
                <h1 className="text-2xl font-black text-white tracking-tight">Uganda Premier League</h1>
                <p className="text-muted text-xs">Live fixtures · Standings · 18 clubs</p>
              </div>
            </div>
            <button onClick={load} disabled={loading}
              className="w-9 h-9 rounded-xl border border-border bg-surface-2 flex items-center justify-center text-muted hover:text-white transition-all disabled:opacity-50">
              {loading ? <SpinnerGap weight="bold" size={14} className="animate-spin"/> : <ArrowClockwise weight="bold" size={14}/>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 mt-5 space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit"
          style={{ background:'rgba(19,17,28,0.9)', border:'1px solid rgba(45,38,69,0.7)' }}>
          {(['fixtures','standings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all"
              style={{
                background: tab===t ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'transparent',
                color: tab===t ? '#fff' : '#7C7A91',
                boxShadow: tab===t ? '0 4px 12px rgba(220,38,38,0.4)' : 'none',
              }}>{t}</button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <SpinnerGap weight="bold" size={28} className="text-red-400 animate-spin"/>
            <p className="text-muted text-sm">Loading UPL data…</p>
          </div>
        )}

        {/* Fixtures */}
        {tab === 'fixtures' && !loading && (
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <SoccerBall weight="duotone" size={40} className="text-muted opacity-40 mx-auto"/>
                <p className="text-white font-bold">No fixtures today</p>
                <p className="text-muted text-sm">Check back on match days</p>
                {/* Static upcoming section */}
                <div className="mt-6 text-left max-w-sm mx-auto">
                  <p className="text-xs font-black text-muted uppercase tracking-wider mb-3">UPL Clubs</p>
                  <div className="grid grid-cols-2 gap-2">
                    {UPL_TEAMS.slice(0, 8).map(team => (
                      <div key={team.name} className="flex items-center gap-2 p-2 rounded-xl"
                        style={{ background:'rgba(19,17,28,0.7)', border:'1px solid rgba(45,38,69,0.5)' }}>
                        {team.badge
                          ? <img src={team.badge} alt={team.short} className="w-7 h-7 object-contain"
                              onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')}/>
                          : <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center text-[9px] font-black text-muted">{team.short}</div>}
                        <span className="text-[11px] font-semibold text-white truncate">{team.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : events.map(ev => {
              const comps = ev.competitions[0]
              if (!comps) return null
              const [home, away] = comps.competitors
              const isDone = ev.status.type.completed
              const isLive = ev.status.type.description === 'In Progress'
              const date   = new Date(ev.date)
              return (
                <div key={ev.id} className="rounded-2xl border transition-all"
                  style={{
                    background: isLive ? 'linear-gradient(135deg,rgba(220,38,38,0.1),rgba(19,17,28,0.95))' : 'rgba(19,17,28,0.7)',
                    border: `1px solid ${isLive ? 'rgba(220,38,38,0.3)' : 'rgba(45,38,69,0.7)'}`,
                  }}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img src={home?.team.logo} alt="" className="w-7 h-7 object-contain shrink-0"
                        onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')}/>
                      <span className={`text-sm font-bold truncate ${home?.winner ? 'text-white' : isDone ? 'text-muted' : 'text-white'}`}>
                        {home?.team.displayName}
                      </span>
                    </div>
                    <div className="shrink-0 text-center min-w-[76px]">
                      {isLive || isDone ? (
                        <div className="flex flex-col items-center">
                          <span className={`text-lg font-black tabular-nums ${isLive ? 'text-red-400' : 'text-white'}`}>
                            {home?.score ?? 0}–{away?.score ?? 0}
                          </span>
                          {isLive && <span className="flex items-center gap-1 text-[9px] text-red-400 font-black"><span className="w-1 h-1 bg-red-500 rounded-full live-dot"/>LIVE</span>}
                          {isDone && !isLive && <span className="text-[9px] text-muted font-bold">FT</span>}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-white tabular-nums">{date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                          <span className="text-[9px] text-muted">{date.toLocaleDateString([],{month:'short',day:'numeric'})}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className={`text-sm font-bold truncate text-right ${away?.winner ? 'text-white' : isDone ? 'text-muted' : 'text-white'}`}>
                        {away?.team.displayName}
                      </span>
                      <img src={away?.team.logo} alt="" className="w-7 h-7 object-contain shrink-0"
                        onError={e => ((e.currentTarget as HTMLImageElement).style.display='none')}/>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Standings */}
        {tab === 'standings' && !loading && (
          <div className="rounded-2xl overflow-hidden border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-wider text-muted"
                  style={{ background:'rgba(19,17,28,0.9)' }}>
                  <th className="px-3 py-3 text-left w-6">#</th>
                  <th className="px-2 py-3 text-left">Club</th>
                  <th className="px-2 py-3 text-center">P</th>
                  <th className="px-2 py-3 text-center">W</th>
                  <th className="px-2 py-3 text-center">D</th>
                  <th className="px-2 py-3 text-center">L</th>
                  <th className="px-2 py-3 text-center">GD</th>
                  <th className="px-2 py-3 text-center font-black text-white">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.length === 0
                  ? UPL_TEAMS.map((team, i) => (
                    <tr key={team.name}
                      style={{ background: i%2===0 ? 'rgba(19,17,28,0.7)' : 'rgba(13,11,20,0.7)', borderTop:'1px solid rgba(45,38,69,0.4)' }}>
                      <td className="px-3 py-2.5 text-muted">{i+1}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2">
                          {team.badge
                            ? <img src={team.badge} alt="" className="w-5 h-5 object-contain" onError={e=>((e.currentTarget as HTMLImageElement).style.display='none')}/>
                            : <div className="w-5 h-5 rounded-full bg-surface-2 text-[8px] font-black text-muted flex items-center justify-center">{team.short}</div>}
                          <span className="font-semibold text-white truncate">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-center text-muted">—</td>
                      <td className="px-2 py-2.5 text-center text-muted">—</td>
                      <td className="px-2 py-2.5 text-center text-muted">—</td>
                      <td className="px-2 py-2.5 text-center text-muted">—</td>
                      <td className="px-2 py-2.5 text-center text-muted">—</td>
                      <td className="px-2 py-2.5 text-center font-black text-white">—</td>
                    </tr>
                  ))
                  : standings.map((s, i) => (
                    <tr key={i}
                      style={{ background: i%2===0 ? 'rgba(19,17,28,0.7)' : 'rgba(13,11,20,0.7)', borderTop:'1px solid rgba(45,38,69,0.4)' }}>
                      <td className="px-3 py-2.5 text-muted">{i+1}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2">
                          {s.team.logos?.[0]?.href
                            ? <img src={s.team.logos[0].href} alt="" className="w-5 h-5 object-contain" onError={e=>((e.currentTarget as HTMLImageElement).style.display='none')}/>
                            : <div className="w-5 h-5 rounded-full bg-surface-2"/>}
                          <span className="font-semibold text-white truncate">{s.team.displayName}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-center text-muted">{getStat(s,'gamesPlayed')}</td>
                      <td className="px-2 py-2.5 text-center text-muted">{getStat(s,'wins')}</td>
                      <td className="px-2 py-2.5 text-center text-muted">{getStat(s,'ties')}</td>
                      <td className="px-2 py-2.5 text-center text-muted">{getStat(s,'losses')}</td>
                      <td className="px-2 py-2.5 text-center text-muted">{getStat(s,'pointDifferential')}</td>
                      <td className="px-2 py-2.5 text-center font-black text-white">{getStat(s,'points')}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        {lastUpdated && (
          <p className="text-[10px] text-muted text-center">
            Updated {lastUpdated.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
          </p>
        )}
      </div>
    </div>
  )
}

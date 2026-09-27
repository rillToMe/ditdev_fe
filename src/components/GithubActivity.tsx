import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiLoader, FiRefreshCw } from 'react-icons/fi'
import ZoneHeader from './systems/ZoneHeader'
import PixelIcon from './systems/PixelIcon'
import PixelButton from './systems/PixelButton'
import { SITE } from '../data/site'
import { slideIn, stagger, scan } from '../lib/motion'
import type { GitHubActivityResponse, GitHubEvent, GitHubRepo } from '../types/api'

const GITHUB_USERNAME = SITE.githubUser
const API_BASE = import.meta.env.VITE_API_URL || '/api'

/* ── Contribution radar (heatmap framed as a scanner readout) ───────── */
function ContribRadar() {
  const [loaded,  setLoaded]  = useState(false)
  const [errored, setErrored] = useState(false)
  const [key,     setKey]     = useState(0)

  const chartUrl = `${API_BASE}/github/heatmap`
  // Canonical github-readme-activity-graph deployment is dead (402), so the
  // fallback points at a live community mirror with the same /graph API.
  const fallbackUrl = `https://github-readme-activity-graph-ivory.vercel.app/graph?username=${GITHUB_USERNAME}&bg_color=0a0e1a&color=4f8cff&line=00d4ff&point=4f8cff&area=true&hide_border=true&theme=react-dark`

  return (
    <div className="relative">
      {!loaded && !errored && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <FiLoader className="text-pixel-blue animate-spin text-sm" />
            <span className="font-mono text-xs text-pixel-gray/40">scanning contribution signal…</span>
          </div>
        </div>
      )}

      {!errored && (
        <img
          key={key}
          src={chartUrl}
          alt={`${GITHUB_USERNAME} contribution graph`}
          className={`w-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            filter: 'invert(1) hue-rotate(195deg) saturate(1.8) brightness(0.85) contrast(1.1)',
            minHeight: loaded ? 'auto' : '130px',
          }}
          onLoad={() => setLoaded(true)}
          onError={() => { setErrored(true); setLoaded(false) }}
        />
      )}

      {errored && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[9px] text-pixel-gray/30">primary source offline — using fallback feed</span>
            <button
              onClick={() => { setErrored(false); setLoaded(false); setKey(k => k + 1) }}
              className="flex items-center gap-1 font-mono text-[9px] text-pixel-blue/60 hover:text-pixel-blue transition-colors"
            >
              <FiRefreshCw className="text-[9px]" /> retry
            </button>
          </div>
          <img src={fallbackUrl} alt={`${GITHUB_USERNAME} activity graph`} className="w-full" style={{ minHeight: '150px' }} />
        </div>
      )}

      {loaded && !errored && (
        <p className="mt-2 font-mono text-[8px] text-pixel-gray/20 text-right">
          live signal · real contribution data
        </p>
      )}
    </div>
  )
}

interface EventMeta { label: string; color: string }

const EVENT_META: Record<string, EventMeta> = {
  PushEvent:        { label: 'PUSH',   color: '#4f8cff' },
  CreateEvent:      { label: 'CREATE', color: '#00d4ff' },
  WatchEvent:       { label: 'STAR',   color: '#ffd700' },
  ForkEvent:        { label: 'FORK',   color: '#39d353' },
  PullRequestEvent: { label: 'PR',     color: '#c084fc' },
}

function getTimeAgo(date: Date) {
  const diff = Date.now() - date.getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (days > 0)  return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0)  return `${mins}m ago`
  return 'just now'
}

/* ── Terminal log line ──────────────────────────────────────────────── */
function LogLine({ event, index }: { event: GitHubEvent; index: number }) {
  const repo  = event.repo?.name?.replace(`${GITHUB_USERNAME}/`, '') || 'unknown'
  const msg   = event.payload?.commits?.[0]?.message || event.payload?.description || 'activity'
  const count = event.payload?.commits?.length || 1
  const date  = new Date(event.created_at ?? '')
  const meta  = EVENT_META[event.type ?? ''] || { label: (event.type || 'EVENT').replace('Event', '').toUpperCase(), color: '#8892a4' }

  return (
    <motion.div
      variants={slideIn('left', 18)}
      className="group flex items-start gap-3 px-3 py-2.5 border-l-2 bg-bg-card/20 hover:bg-bg-hover/30 transition-colors"
      style={{ borderColor: `${meta.color}55` }}
    >
      <span className="font-mono text-[10px] text-pixel-gray/25 pt-0.5 shrink-0 tabular-nums">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="font-pixel text-[7px] px-1.5 py-0.5 border shrink-0"
            style={{ color: meta.color, borderColor: `${meta.color}44`, background: `${meta.color}0d` }}
          >
            {meta.label}
          </span>
          <a
            href={`https://github.com/${event.repo?.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-pixel-blue/70 hover:text-pixel-cyan truncate max-w-[160px] transition-colors"
          >
            {repo}
          </a>
          {count > 1 && <span className="font-mono text-[9px] text-pixel-gray/40">+{count - 1}</span>}
        </div>
        <p className="font-mono text-xs text-pixel-gray/60 truncate group-hover:text-pixel-gray/90 transition-colors">
          {msg.split('\n')[0].slice(0, 72)}{msg.length > 72 ? '…' : ''}
        </p>
      </div>

      <span className="font-mono text-[9px] text-pixel-gray/30 shrink-0 pt-0.5">{getTimeAgo(date)}</span>
    </motion.div>
  )
}

function Readout({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div
      className="flex flex-col px-4 py-2.5 border bg-bg-card/40 min-w-[92px]"
      style={{ borderColor: `${accent}26`, clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
    >
      <span className="font-pixel text-base tabular-nums" style={{ color: accent }}>{value}</span>
      <span className="font-mono text-[9px] text-pixel-gray/40 tracking-widest uppercase mt-0.5">{label}</span>
    </div>
  )
}

interface GitHubStats {
  public_repos: number
  followers: number
  following: number
  total_stars: number
}

type TabKey = 'signal' | 'log' | 'repos'

export default function GitHubActivity() {
  const [events,  setEvents]  = useState<GitHubEvent[]>([])
  const [stats,   setStats]   = useState<GitHubStats | null>(null)
  const [repos,   setRepos]   = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const [tab,     setTab]     = useState<TabKey>('signal')
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 })

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(`${API_BASE}/github/activity`)
        if (!res.ok) throw new Error('GitHub API error')
        const data = (await res.json()) as GitHubActivityResponse

        const evData   = data.events || []
        const userData = data.user   || {}
        const repoData = data.repos  || []

        setEvents(Array.isArray(evData) ? evData : [])
        setStats({
          public_repos: userData.public_repos || 0,
          followers:    userData.followers    || 0,
          following:    userData.following    || 0,
          total_stars:  Array.isArray(repoData) ? repoData.reduce((s, r) => s + (r.stargazers_count || 0), 0) : 0,
        })
        setRepos(Array.isArray(repoData) ? repoData.slice(0, 3) : [])
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const allEvents = events.slice(0, 15)
  const totalContribs = events.length

  const TABS: { key: TabKey; label: string; icon: 'calendar' | 'terminal' | 'scroll' }[] = [
    { key: 'signal', label: 'SIGNAL', icon: 'calendar' },
    { key: 'log',    label: 'LOG',    icon: 'terminal' },
    { key: 'repos',  label: 'REPOS',  icon: 'scroll'   },
  ]

  return (
    <section id="github" className="relative pt-14 pb-28 overflow-hidden">
      <div className="absolute inset-0 grid-faint opacity-50 pointer-events-none" />

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <ZoneHeader
          variant="terminal"
          index="07"
          tag="telemetry"
          title="Build"
          accent="Telemetry"
          icon="bolt"
          meta={`@${GITHUB_USERNAME}`}
          subtitle="Live signal from the commit stream."
        />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FiLoader className="text-pixel-blue text-2xl animate-spin mr-3" />
            <span className="font-mono text-pixel-gray text-sm">Establishing uplink…</span>
          </div>
        ) : error ? (
          <div className="text-center py-16 border border-pixel-blue/10">
            <p className="font-pixel text-pixel-gray/30 text-xs mb-2">SIGNAL LOST</p>
            <p className="font-mono text-pixel-gray/20 text-xs">GitHub rate limit or network error</p>
          </div>
        ) : (
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
          >
            {/* Readouts */}
            {stats && (
              <motion.div variants={scan} className="flex flex-wrap gap-3 mb-10">
                <Readout value={stats.public_repos} label="Repos"     accent="#4f8cff" />
                <Readout value={stats.total_stars}  label="Stars"     accent="#ffd700" />
                <Readout value={stats.followers}    label="Followers" accent="#00d4ff" />
                <Readout value={totalContribs}      label="Events 90d" accent="#39d353" />
              </motion.div>
            )}

            {/* Console tabs */}
            <motion.div variants={scan} className="flex items-center gap-0 mb-6 border border-pixel-blue/15 w-fit">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 font-pixel text-[9px] tracking-widest transition-colors ${
                    tab === t.key
                      ? 'bg-pixel-blue/20 text-pixel-cyan border-b-2 border-pixel-cyan'
                      : 'text-pixel-gray/40 hover:text-pixel-gray/70 hover:bg-pixel-blue/5'
                  }`}
                >
                  <PixelIcon name={t.icon} size={11} />
                  {t.label}
                </button>
              ))}
            </motion.div>

            {/* Tab: signal */}
            {tab === 'signal' && (
              <motion.div
                key="signal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 sm:p-6 border border-pixel-blue/15 bg-bg-card/20 relative"
                style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
              >
                {/* Corner scan brackets */}
                {['top-0 left-0 border-t-2 border-l-2','top-0 right-5 border-t-2 border-r-2','bottom-5 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
                  <div key={i} className={`absolute w-4 h-4 border-pixel-cyan/40 ${cls}`} />
                ))}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-xs text-pixel-gray/50">Contributions · trailing 12 months</span>
                  <span className="font-pixel text-[8px] text-pixel-blue/40 tracking-widest">RADAR FEED</span>
                </div>
                <ContribRadar />
              </motion.div>
            )}

            {/* Tab: log */}
            {tab === 'log' && (
              <motion.div key="log" variants={stagger(0.05)} initial="hidden" animate="show" className="space-y-1.5">
                <div className="flex items-center gap-2 mb-3 font-mono text-[10px] text-pixel-gray/40">
                  <span className="w-2 h-2 bg-red-400/60" />
                  <span className="w-2 h-2 bg-yellow-400/60" />
                  <span className="w-2 h-2 bg-green-400/60" />
                  <span className="ml-2">git log --author={GITHUB_USERNAME} -n 15</span>
                </div>
                {allEvents.length === 0 ? (
                  <div className="text-center py-12 border border-pixel-blue/10">
                    <p className="font-pixel text-pixel-gray/30 text-xs">NO RECENT ACTIVITY</p>
                  </div>
                ) : (
                  allEvents.map((ev, i) => <LogLine key={ev.id ?? i} event={ev} index={i} />)
                )}
                <div className="mt-5 flex justify-center">
                  <PixelButton variant="ghost" icon="external" href={`https://github.com/${GITHUB_USERNAME}?tab=overview`}>
                    FULL COMMIT STREAM
                  </PixelButton>
                </div>
              </motion.div>
            )}

            {/* Tab: repos */}
            {tab === 'repos' && (
              <motion.div key="repos" variants={stagger(0.08)} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {repos.length === 0 ? (
                  <div className="col-span-full text-center py-12 border border-pixel-blue/10">
                    <p className="font-pixel text-pixel-gray/30 text-xs">NO REPOS FOUND</p>
                  </div>
                ) : (
                  repos.map((repo, i) => (
                    <motion.a
                      key={repo.id ?? repo.name ?? i}
                      variants={slideIn('left', 18)}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block p-5 border border-pixel-blue/15 bg-bg-card/30 hover:border-pixel-blue/45 hover:bg-bg-hover/30 transition-colors"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <PixelIcon name="scroll" size={13} className="text-pixel-blue/60 shrink-0" />
                          <span className="font-mono text-sm text-pixel-white group-hover:text-pixel-cyan transition-colors truncate">
                            {repo.name}
                          </span>
                        </div>
                        <PixelIcon name="external" size={12} className="text-pixel-gray/30 shrink-0 group-hover:text-pixel-cyan/70 transition-colors" />
                      </div>

                      <p className="font-mono text-xs text-pixel-gray/50 leading-relaxed line-clamp-2 mb-3 min-h-[2rem]">
                        {repo.description || 'No description'}
                      </p>

                      <div className="flex items-center gap-3 pt-3 border-t border-pixel-blue/10">
                        {repo.language && (
                          <span className="flex items-center gap-1.5 font-mono text-[9px] text-pixel-cyan/60">
                            <span className="w-1.5 h-1.5 bg-pixel-cyan/60 inline-block" />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-mono text-[9px] text-pixel-gray/40">
                          <PixelIcon name="star" size={9} className="text-yellow-400/50" />
                          {repo.stargazers_count}
                        </span>
                        {repo.fork && <span className="font-mono text-[9px] text-pixel-gray/25">fork</span>}
                      </div>
                    </motion.a>
                  ))
                )}
                <div className="col-span-full flex justify-center">
                  <PixelButton variant="ghost" icon="external" href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`}>
                    ALL REPOSITORIES
                  </PixelButton>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  )
}

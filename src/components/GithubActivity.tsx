import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiGithub, FiGitCommit, FiStar, FiCode, FiExternalLink, FiLoader, FiRefreshCw } from 'react-icons/fi'
import type { GitHubActivityResponse, GitHubEvent, GitHubRepo } from '../types/api'
import type { ReactNode } from 'react'

const GITHUB_USERNAME = 'rillToMe'
const API_BASE = import.meta.env.VITE_API_URL || '/api'

const ContribHeatmap = ({ username }: { username: string }) => {
  const [loaded,  setLoaded]  = useState(false)
  const [errored, setErrored] = useState(false)
  const [key,     setKey]     = useState(0)

  // Proxied via the backend so the browser caches it (Cache-Control) and doesn't
  // re-fetch on every tab switch. Backend falls back to the activity-graph service.
  const chartUrl = `${API_BASE}/github/heatmap`

  // Fallback: github-readme-stats activity graph
  const fallbackUrl = `https://github-readme-activity-graph.vercel.app/graph?username=${username}&bg_color=0a0e1a&color=4f8cff&line=00d4ff&point=4f8cff&area=true&hide_border=true&theme=react-dark`

  return (
    <div className="relative">
      {/* Loading skeleton */}
      {!loaded && !errored && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <FiLoader className="text-pixel-blue animate-spin text-sm" />
            <span className="font-mono text-xs text-pixel-gray/40">Loading contribution graph...</span>
          </div>
        </div>
      )}

      {/* Primary: ghchart SVG */}
      {!errored && (
        <img
          key={key}
          src={chartUrl}
          alt={`${username} GitHub contribution graph`}
          className={`w-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            filter: 'invert(1) hue-rotate(195deg) saturate(1.8) brightness(0.85) contrast(1.1)',
            imageRendering: 'auto',
            minHeight: loaded ? 'auto' : '130px',
          }}
          onLoad={() => setLoaded(true)}
          onError={() => { setErrored(true); setLoaded(false) }}
        />
      )}

      {/* Fallback */}
      {errored && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[9px] text-pixel-gray/30">Primary source failed, using fallback...</span>
            <button
              onClick={() => { setErrored(false); setLoaded(false); setKey(k => k + 1) }}
              className="flex items-center gap-1 font-mono text-[9px] text-pixel-blue/50 hover:text-pixel-blue transition-colors"
            >
              <FiRefreshCw className="text-[9px]" /> retry
            </button>
          </div>
          <img
            src={fallbackUrl}
            alt={`${username} GitHub activity graph`}
            className="w-full rounded"
            style={{ minHeight: '150px' }}
            onError={() => {}}
          />
        </div>
      )}

      {/* Note */}
      {loaded && !errored && (
        <p className="mt-2 font-mono text-[8px] text-pixel-gray/20 text-right">
          via ghchart.rshah.org · real contribution data
        </p>
      )}
    </div>
  )
}

interface EventTypeConfig {
  icon: ReactNode
  color: string
  label: string
}

// Commit Card
const CommitCard = ({ event, index }: { event: GitHubEvent; index: number }) => {
  const repo   = event.repo?.name?.replace(`${GITHUB_USERNAME}/`, '') || 'unknown'
  const msg    = event.payload?.commits?.[0]?.message || event.payload?.description || 'Activity'
  const count  = event.payload?.commits?.length || 1
  const date   = new Date(event.created_at ?? '')
  const ago    = getTimeAgo(date)

  const typeConfig: Record<string, EventTypeConfig> = {
    PushEvent:         { icon: <FiGitCommit />, color: 'text-pixel-blue',  label: 'PUSH'   },
    CreateEvent:       { icon: <FiCode />,      color: 'text-pixel-cyan',  label: 'CREATE' },
    WatchEvent:        { icon: <FiStar />,      color: 'text-pixel-yellow',label: 'STAR'   },
    ForkEvent:         { icon: <FiGithub />,    color: 'text-green-400',   label: 'FORK'   },
    PullRequestEvent:  { icon: <FiCode />,      color: 'text-purple-400',  label: 'PR'     },
  }

  const cfg: EventTypeConfig = typeConfig[event.type ?? ''] || { icon: <FiGithub />, color: 'text-pixel-gray', label: event.type?.replace('Event','') || 'EVENT' }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group flex items-start gap-3 p-3 border border-pixel-blue/10 bg-bg-card/30 hover:border-pixel-blue/30 hover:bg-bg-hover/20 transition-all duration-200"
      style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
    >
      {/* Type icon */}
      <div className={`mt-0.5 text-sm flex-shrink-0 ${cfg.color}`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span
            className="font-pixel text-[7px] px-1.5 py-0.5 border"
            style={{ color: cfg.color.includes('pixel-blue') ? '#4f8cff' : cfg.color.includes('pixel-cyan') ? '#00d4ff' : cfg.color.includes('pixel-yellow') ? '#fbbf24' : cfg.color.includes('green') ? '#4ade80' : '#a78bfa', borderColor: 'currentColor', background: 'rgba(255,255,255,0.03)' }}
          >
            {cfg.label}
          </span>
          <a
            href={`https://github.com/${event.repo?.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-pixel-blue/70 hover:text-pixel-blue truncate max-w-[140px] transition-colors"
          >
            {repo}
          </a>
          {count > 1 && (
            <span className="font-mono text-[9px] text-pixel-gray/40">+{count - 1} more</span>
          )}
        </div>
        <p className="font-mono text-xs text-pixel-gray/60 truncate group-hover:text-pixel-gray/80 transition-colors">
          {msg.split('\n')[0].slice(0, 72)}{msg.length > 72 ? '…' : ''}
        </p>
      </div>

      {/* Time */}
      <div className="flex-shrink-0 text-right">
        <span className="font-mono text-[9px] text-pixel-gray/30">{ago}</span>
      </div>
    </motion.div>
  )
}

// Stats Row
const StatPill = ({ value, label }: { value: number; label: string }) => (
  <div
    className={`flex flex-col items-center px-4 py-2 border bg-bg-card/40`}
    style={{
      borderColor: `rgba(79,140,255,0.15)`,
      clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
    }}
  >
    <span className={`font-pixel text-lg text-pixel-blue`}>{value}</span>
    <span className="font-mono text-[9px] text-pixel-gray/40 tracking-widest uppercase">{label}</span>
  </div>
)

// Time ago helper
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

interface GitHubStats {
  public_repos: number
  followers: number
  following: number
  total_stars: number
}

type TabKey = 'graph' | 'commits' | 'repos'

// Main Component
export default function GitHubActivity() {
  const [events,   setEvents]   = useState<GitHubEvent[]>([])
  const [stats,    setStats]    = useState<GitHubStats | null>(null)
  const [repos,    setRepos]    = useState<GitHubRepo[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [tab,      setTab]      = useState<TabKey>('graph')
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetched via the backend proxy to avoid GitHub's unauthenticated
        // 60 req/hr rate limit on the browser's IP.
        const res = await fetch(`${API_BASE}/github/activity`)
        if (!res.ok) throw new Error('GitHub API error')
        const data = (await res.json()) as GitHubActivityResponse

        const evData   = data.events || []
        const userData = data.user   || {}
        const repoData = data.repos  || []

        setEvents(Array.isArray(evData) ? evData : [])
        setStats({
          public_repos:  userData.public_repos  || 0,
          followers:     userData.followers      || 0,
          following:     userData.following      || 0,
          total_stars:   Array.isArray(repoData) ? repoData.reduce((s, r) => s + (r.stargazers_count || 0), 0) : 0,
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

  const allEvents  = events.slice(0, 15)
  const totalContribs = events.length

  return (
    <section id="github" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="section-tag mb-3">// 06. github</p>
          <div className="flex items-end gap-4 flex-wrap">
            <h2 className="font-sans font-bold text-4xl md:text-5xl text-pixel-white">
              Code <span className="gradient-text">Activity</span>
            </h2>
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-1 inline-flex items-center gap-1.5 font-mono text-xs text-pixel-gray/50 hover:text-pixel-blue transition-colors"
            >
              <FiGithub className="text-sm" />
              @{GITHUB_USERNAME}
              <FiExternalLink className="text-[10px]" />
            </a>
          </div>
          <div className="section-divider max-w-xs mt-4" />
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FiLoader className="text-pixel-blue text-2xl animate-spin mr-3" />
            <span className="font-mono text-pixel-gray text-sm">Fetching GitHub data...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16 border border-pixel-blue/10">
            <p className="font-pixel text-pixel-gray/30 text-xs mb-2">FAILED TO LOAD</p>
            <p className="font-mono text-pixel-gray/20 text-xs">GitHub API rate limit or network error</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Stats row */}
            {stats && (
              <div className="flex flex-wrap gap-3 mb-10">
                <StatPill value={stats.public_repos}  label="Repos"     />
                <StatPill value={stats.total_stars}   label="Stars"     />
                <StatPill value={stats.followers}     label="Followers" />
                <StatPill value={totalContribs}       label="Events (90d)" />
              </div>
            )}

            {/* Tab switcher */}
            <div className="flex items-center gap-0 mb-6 border border-pixel-blue/15 w-fit">
              {[
                { key: 'graph',   label: '◈ HEATMAP'      },
                { key: 'commits', label: '⬡ COMMITS'       },
                { key: 'repos',   label: '◻ TOP REPOS'    },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as TabKey)}
                  className={`px-4 py-2 font-pixel text-[9px] tracking-widest transition-all duration-150 ${
                    tab === t.key
                      ? 'bg-pixel-blue/20 text-pixel-blue border-b-2 border-pixel-blue'
                      : 'text-pixel-gray/40 hover:text-pixel-gray/70 hover:bg-pixel-blue/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Heatmap */}
            {tab === 'graph' && (
              <motion.div
                key="graph"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="p-6 border border-pixel-blue/15 bg-bg-card/20"
                style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-xs text-pixel-gray/50">
                    Contributions in the last year
                  </span>
                  <span className="font-pixel text-[8px] text-pixel-blue/40 tracking-widest">CONTRIBUTION GRAPH</span>
                </div>
                <ContribHeatmap username={GITHUB_USERNAME} />
              </motion.div>
            )}

            {/* Tab: Commits */}
            {tab === 'commits' && (
              <motion.div
                key="commits"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {allEvents.length === 0 ? (
                  <div className="text-center py-12 border border-pixel-blue/10">
                    <p className="font-pixel text-pixel-gray/30 text-xs">NO RECENT ACTIVITY</p>
                  </div>
                ) : (
                  allEvents.map((ev, i) => (
                    <CommitCard key={ev.id ?? i} event={ev} index={i} />
                  ))
                )}
                <div className="mt-4 flex justify-center">
                  <a
                    href={`https://github.com/${GITHUB_USERNAME}?tab=overview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pixel text-xs inline-flex items-center gap-2"
                  >
                    <FiGithub /> View Full Activity
                  </a>
                </div>
              </motion.div>
            )}

            {/* Tab: Top Repos */}
            {tab === 'repos' && (
              <motion.div
                key="repos"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {repos.length === 0 ? (
                  <div className="col-span-3 text-center py-12 border border-pixel-blue/10">
                    <p className="font-pixel text-pixel-gray/30 text-xs">NO REPOS FOUND</p>
                  </div>
                ) : (
                  repos.map((repo, i) => (
                    <motion.a
                      key={repo.id ?? repo.name ?? i}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="group block p-5 border border-pixel-blue/15 bg-bg-card/30 hover:border-pixel-blue/40 hover:bg-bg-hover/30 transition-all duration-200"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FiCode className="text-pixel-blue/60 text-sm flex-shrink-0" />
                          <span className="font-mono text-sm text-pixel-white group-hover:text-pixel-blue transition-colors truncate max-w-[140px]">
                            {repo.name}
                          </span>
                        </div>
                        <FiExternalLink className="text-pixel-gray/30 text-xs flex-shrink-0 group-hover:text-pixel-blue/60 transition-colors" />
                      </div>

                      <p className="font-mono text-xs text-pixel-gray/50 leading-relaxed line-clamp-2 mb-3">
                        {repo.description || 'No description'}
                      </p>

                      <div className="flex items-center gap-3 pt-3 border-t border-pixel-blue/10">
                        {repo.language && (
                          <span className="font-mono text-[9px] text-pixel-cyan/60 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-pixel-cyan/60 inline-block" />
                            {repo.language}
                          </span>
                        )}
                        <span className="font-mono text-[9px] text-pixel-gray/30 flex items-center gap-1">
                          <FiStar className="text-[8px]" />
                          {repo.stargazers_count}
                        </span>
                        {repo.fork && (
                          <span className="font-mono text-[9px] text-pixel-gray/20">fork</span>
                        )}
                      </div>
                    </motion.a>
                  ))
                )}
                <div className="col-span-full mt-2 flex justify-center">
                  <a
                    href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pixel text-xs inline-flex items-center gap-2"
                  >
                    <FiGithub /> View All Repositories
                  </a>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  )
}
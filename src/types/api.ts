// Data shapes mirroring the `ditdev_be_rust` (Axum) API.
// All public list/get endpoints return `{ success, data, count?, message? }`.

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  count?: number
  message?: string
}

// ── Projects ─────────────────────────────────────────
export interface ProjectLink {
  type: string
  url: string
}

export interface Project {
  id: number
  title: string
  description: string
  thumbnail: string | null
  tags: string[] | null
  links: ProjectLink[] | null
  created_at: string
  updated_at: string
}

export interface ProjectInput {
  title?: string
  description?: string
  thumbnail?: string
  tags?: string[]
  links?: ProjectLink[]
}

// ── Certificates ─────────────────────────────────────
export interface Certificate {
  id: number
  title: string
  provider: string
  thumbnail: string | null
  issue_date: string | null
  credential_url: string | null
  pdf_file: string
  created_at: string
}

export interface CertificateInput {
  title?: string
  provider?: string
  thumbnail?: string
  issue_date?: string
  credential_url?: string
  pdf_file?: string
}

// ── Stats ────────────────────────────────────────────
export interface Stat {
  id: number
  key: string
  value: number | null
  label: string
  start_date: string | null
  created_at: string
  updated_at: string
  calculated?: boolean
}

export interface StatInput {
  key?: string
  label?: string
  value?: number
  start_date?: string
}

// ── Auth ─────────────────────────────────────────────
export interface Admin {
  id: number
  username: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  token: string
  admin: Admin
  expiresIn?: string | number
}

// ── Contact ──────────────────────────────────────────
export interface ContactMessage {
  name: string
  email: string
  message: string
}

// ── Chat (CHANGLI-AI) ────────────────────────────────
export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: number
  role: ChatRole
  content: string
}

export interface ChatResponse {
  success: boolean
  reply: string
  message?: string
  usage?: unknown
}

// ── XP bar ───────────────────────────────────────────
export interface XpResponse {
  success: boolean
  total_xp: number
  base_xp?: number
  bonus_xp?: number
  rate_limited?: boolean
  gain?: number
}

// ── Upload ───────────────────────────────────────────
export interface UploadResponse {
  success: boolean
  message: string
  data: {
    filename: string
    path: string
    size: number
    type: string
  }
}

// ── RAG admin ────────────────────────────────────────
export interface RagHealth {
  status?: string
  chunks?: number
  db_ok?: boolean
  cache?: { size?: number; maxsize?: number }
  embed_model?: string
  by_type?: Record<string, number>
}

export interface RagStatusResponse {
  success: boolean
  reachable: boolean
  rebuild_enabled: boolean
  data?: RagHealth
  message?: string
}

// GitHub activity
export interface GitHubEvent {
  id?: string
  type?: string
  created_at?: string
  repo?: { name?: string }
  payload?: {
    commits?: { message?: string }[]
    description?: string
  }
}

export interface GitHubUser {
  public_repos?: number
  followers?: number
  following?: number
}

export interface GitHubRepo {
  id?: number
  name?: string
  full_name?: string
  html_url?: string
  description?: string
  language?: string
  fork?: boolean
  stargazers_count?: number
}

export interface GitHubActivityResponse {
  events: GitHubEvent[]
  user: GitHubUser
  repos: GitHubRepo[]
}
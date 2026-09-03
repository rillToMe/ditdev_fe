# REWRITE PLAN — `ditdev_fe` (React JS) → `ditdev_fe_ts` (React TS + Tailwind v4)

Tujuan: memindahkan seluruh aplikasi portfolio (portfolio publik + admin panel + CHANGLI-AI chat)
dari `ditdev_fe` (JSX) ke `ditdev_fe_ts` (TSX), sambil **migrasi Tailwind v3 → v4**.
Hasil akhir harus *feature-parity* dan sedekat mungkin secara visual dengan `ditdev_fe`.

---

## 1. Inventaris proyek sumber (`ditdev_fe`)

### Struktur
```
src/
├── main.jsx            → entry portfolio (BrowserRouter + App)
├── admin.jsx           → entry legacy admin (TIDAK dipakai di build, lihat §3)
├── router.jsx          → dead code (tidak di-import di mana pun)
├── App.jsx             → routing (/ , /admin, *) + SEO Helmet + lazy load + GameLoadingScreen
├── index.css           → Tailwind v3 directives + custom CSS classes
├── admin/              → App, pages (Login, Dashboard), contexts (ThemeContext),
│                        services (api), components (10 file: modals, managers, cropper…)
├── chat-ai/            → components (ChangliChat, MarkdownRenderer),
│                        hooks (useChat), services (chatService)
├── components/         → 13 file portfolio + footer/ (KnightRunner, ParallaxBackground)
├── custom/             → IdleManager, NotFound, RightClickGuard, SectionLoader
├── hooks/              → useTypewriter.js
├── services/           → api.js (axios: projects, certificates, stats, contact)
└── assets/             → img/icons/*, footer_parallax/{knight,nature,cat}/*, react.svg
public/                 → cv.pdf, favicon.ico, favicon.svg, og-image.png, vite.svg
admin.html              → entry HTML legacy untuk admin (tidak di-build)
```

### Dependency yang benar-benar dipakai (hasil grep import)
| Paket | Pemakaian |
|---|---|
| `react`, `react-dom` | semua |
| `framer-motion` | 25 import (animasi semua komponen) |
| `lucide-react` | 12 import (Education, admin: Login/Dashboard/Register…) |
| `react-icons` (fi/si/di/bi/tb/lu/hi) | 19 import (Hero, About, Projects, Certificates, Skills, Contact, Footer, GithubActivity, ChangliChat) |
| `axios` | services/api.js (portfolio), About.jsx (stats) |
| `react-router-dom` | App.jsx, NotFound.jsx (v7: Routes/Route/useNavigate) |
| `react-intersection-observer` | 5 import (About, Projects, Certificates, Contact, GithubActivity) |
| `react-markdown` + `remark-gfm` | chat-ai MarkdownRenderer |
| `react-helmet-async` | App.jsx (SEO) |
| `react-easy-crop` | admin ImageCropper |
| `@headlessui/react` | admin Dashboard (Menu theme switcher) |

**Tidak dipakai (boleh dibuang):** `react-scroll`, `scroll`, `rollup-plugin-visualizer` (hanya dipakai di vite.config.js, opsional).

### API backend (`ditdev_be_rust` — Axum/axum) — bentuk data aktual
Semua respons publik dibungkus `{ success, data, count?, message? }`; admin login mengembalikan `{ success, token, admin, expiresIn }`.

- **Project**: `{ id, title, description, thumbnail?: string|null, tags?: string[]|null, links?: {type,url}[]|null, created_at, updated_at }`
- **Certificate**: `{ id, title, provider, thumbnail?: string|null, issue_date?: string|null, credential_url?: string|null, pdf_file: string, created_at }`
- **Stat**: `{ id, key, value?: number|null, label, start_date?: string|null, created_at, updated_at, calculated? }` — value bisa hasil hitung (months since start_date / total_projects)
- **Admin**: `{ id, username }`
- Endpoint: `/projects[/:id]`, `/certificates[/:id]`, `/stats[/:key]`, `/auth/login|register|logout|verify`, `/upload` (+`/upload/pdf`), `/rag/status`, `/rag/rebuild`, `/chat`, `/xp`, `/xp/tick`, `/github/activity`, `/github/heatmap`, `/contact`
- Env: `VITE_API_URL` (fallback `'/api'`); dev proxy `/api` → `http://localhost:2817`
- `src/.env` di proyek JS **gitignored & berisi secret** — jangan di-commit; di dev memakai fallback `/api` + proxy.

### Konfigurasi saat ini
- `ditdev_fe`: Vite 7, plugin react + visualizer, proxy 5173→2817, manualChunks (react/motion/markdown). Tailwind v3 via `tailwind.config.js` + `postcss.config.js`.
- `ditdev_fe_ts`: Vite 8, TS ~6.0, React 19.2, ESLint 10 flat + typescript-eslint, tsconfig strict
  (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`).
  **vite.config.ts meng-import `@tailwindcss/vite` tapi paketnya BELUM terpasang** → scaffold saat ini tidak bisa build.

---

## 2. Target struktur `ditdev_fe_ts/src`
```
src/
├── main.tsx                # BrowserRouter + App (ganti konten scaffold)
├── App.tsx                 # routing + SEO + lazy loading (port dari App.jsx)
├── vite-env.d.ts           # reference vite/client + ImportMetaEnv (VITE_API_URL)
├── index.css               # Tailwind v4: @import "tailwindcss" + @theme + custom CSS (port)
├── types/
│   └── api.ts              # Project, ProjectLink, Certificate, Stat, Admin, ApiResponse<T>, ChatMessage, dsb.
├── services/
│   └── api.ts              # axios client bertipe (port src/services/api.js)
├── hooks/
│   └── useTypewriter.ts
├── components/             # 13 file + footer/ (2 file)
├── chat-ai/
│   ├── components/ (ChangliChat, MarkdownRenderer)
│   ├── hooks/ (useChat)
│   └── services/ (chatService)
├── admin/
│   ├── App.tsx
│   ├── pages/ (Login, Dashboard)
│   ├── contexts/ (ThemeContext)
│   ├── services/ (api.ts + getImageUrl)
│   └── components/ (10 file)
├── custom/ (IdleManager, NotFound, RightClickGuard, SectionLoader)
└── assets/ (salin dari ditdev_fe/src/assets)
public/ → salin cv.pdf, favicon.ico, favicon.svg, og-image.png (+ update index.html)
```

---

## 3. Keputusan arsitektur

1. **Tailwind v4** — sesuai pilihan user. Tokens dari `tailwind.config.js` dikonversi ke sintaks `@theme` (lihat §5). Custom CSS classes (`.pixel-border`, `.btn-pixel`, `.gradient-text`, `.grid-overlay`, dsb.) tetap plain CSS seperti sekarang.
2. **Single entry** — buang `admin.html` + `src/admin.jsx`. Vite build sekarang hanya mem-build `index.html` (tidak ada multi-input di vite.config), dan `App.jsx` sudah me-rute `/admin` via React Router dengan lazy loading. Di versi TS rute `/admin` dan `/admin/*` tetap pakai lazy `AdminApp`.
3. **Buang dead code**: `router.jsx` (tidak di-import), dependency `react-scroll`, `scroll`, `rollup-plugin-visualizer` (opsional: bisa dipasang ulang jika ingin bundle stats).
4. **`IdleManager`**: di-import dalam komentar di App.jsx. Port file-nya (agar tidak hilang) tapi biarkan tetap ter-comment seperti aslinya.
5. **Tanpa `enum`** (karena `erasableSyntaxOnly`) — pakai string-union type + `as const` objects.
6. **`import type` wajib** untuk type-only import (karena `verbatimModuleSyntax`).
7. **Pakai `bun`** (sudah ada `bun.lock` di kedua proyek dan root).

---

## 4. Persiapan tooling

### 4.1 Dependencies (`bun add`)
```
bun add axios framer-motion lucide-react react-icons react-helmet-async \
       react-router-dom react-intersection-observer react-markdown remark-gfm \
       react-easy-crop @headlessui/react
bun add -d tailwindcss @tailwindcss/vite
```
(`@types/react` / `@types/react-dom` sudah ada di scaffold.)

### 4.2 `vite.config.ts`
- Pertahankan `@vitejs/plugin-react` + `@tailwindcss/vite`.
- Tambahkan dev server proxy `/api` → `http://localhost:2817` (changeOrigin), port 5173.
- Opsional: `build.chunkSizeWarningLimit: 800` + `manualChunks` (react/motion/markdown) seperti proyek JS.

### 4.3 `tsconfig.app.json`
- Scaffold sudah memadai. Perlu dicek:
  - `types: ["vite/client"]` sudah ada (mencakup deklarasi import `*.png/*.jpg/*.jpeg/*.svg`).
  - `erasableSyntaxOnly` → hindari enum (lihat §3.5).
- Tambahkan `src/vite-env.d.ts`:
  ```ts
  /// <reference types="vite/client" />
  interface ImportMetaEnv { readonly VITE_API_URL?: string }
  interface ImportMeta { readonly env: ImportMetaEnv }
  ```

### 4.4 `eslint.config.js`
- Scaffold sudah meng-cover `**/*.{ts,tsx}` dengan recommended + react-hooks + react-refresh. Tidak perlu perubahan besar; mungkin tambah `no-unused-vars` pattern `^[A-Z_]` bila ingin paritas dengan proyek JS.

### 4.5 `index.html`
- Salin metadata/SEO + Google Fonts (`Press Start 2P`, `JetBrains Mono`, `Outfit`) + favicon/og tags + JSON-LD dari `ditdev_fe/index.html` (ganti `/src/main.jsx` → `/src/main.tsx`).

### 4.6 Env
- Buat `.env` lokal (gitignored) jika butuh `VITE_API_URL` non-default; dev cukup fallback `'/api'` + proxy. Jangan menyalin `src/.env` berisi secret ke versi TS kecuali memang perlu; jika perlu, salin manual oleh user.

---

## 5. `index.css` — migrasi Tailwind v3 → v4

Pola konversi dari `tailwind.config.js` ke `@theme` (Tailwind v4):

```css
@import "tailwindcss";

@theme {
  /* fontFamily */
  --font-pixel: "Press Start 2P", cursive;
  --font-mono: "JetBrains Mono", monospace;
  --font-sans: "Outfit", sans-serif;

  /* colors: bg-* dan pixel-* (semua dari theme.extend.colors) */
  --color-bg-primary: #0a0e1a;
  --color-bg-secondary: #0d1224;
  --color-bg-card: #111827;
  --color-bg-hover: #1a2035;
  --color-pixel-blue: #4f8cff;
  --color-pixel-cyan: #00d4ff;
  --color-pixel-purple: #7c5cbf;
  --color-pixel-green: #39d353;
  --color-pixel-yellow: #ffd700;
  --color-pixel-red: #ff4757;
  --color-pixel-pink: #ff6b9d;
  --color-pixel-white: #e8eaf6;
  --color-pixel-gray: #8892a4;
  --color-pixel-dark: #1e2a3a;

  /* backgroundImage */
  --background-image-grid-pattern: linear-gradient(rgba(79,140,255,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79,140,255,.03) 1px, transparent 1px);
  --background-image-scan-lines: repeating-linear-gradient(0deg, transparent, transparent 2px,
    rgba(0,0,0,.1) 2px, rgba(0,0,0,.1) 4px);
  --background-size-grid: 40px 40px;

  /* animations: --animate-* + @keyframes (di dalam @theme) */
  --animate-blink: blink 1s step-end infinite;
  --animate-float: float 3s ease-in-out infinite;
  --animate-float-slow: float 5s ease-in-out infinite;
  --animate-pixel-in: pixelIn .6s steps(6) forwards;
  --animate-scanline: scanline 8s linear infinite;
  --animate-glow-pulse: glowPulse 2s ease-in-out infinite;
  --animate-slide-up: slideUp .6s ease forwards;
  --animate-spin-slow: spin 8s linear infinite;
  --animate-marquee: marquee 25s linear infinite;

  @keyframes blink { ... }
  @keyframes float { ... }
  @keyframes pixelIn { ... }
  @keyframes scanline { ... }
  @keyframes glowPulse { ... }
  @keyframes slideUp { ... }
  @keyframes marquee { ... }

  /* boxShadow / dropShadow */
  --shadow-pixel: 4px 4px 0px #000, inset -4px -4px 0px rgba(0,0,0,.3);
  --shadow-pixel-blue: 0 0 15px rgba(79,140,255,.4), 4px 4px 0px rgba(79,140,255,.2);
  --shadow-pixel-cyan: 0 0 15px rgba(0,212,255,.4);
  --shadow-glow-blue: 0 0 20px rgba(79,140,255,.5);
  --shadow-glow-cyan: 0 0 20px rgba(0,212,255,.5);
  --drop-shadow-pixel: 2px 2px 0px rgba(0,0,0,.8);
  --drop-shadow-glow: 0 0 8px rgba(79,140,255,.8);
}
```

Kemudian salin **semua custom CSS classes** (`:root` vars, `*` reset, scrollbar,
`.pixel-border*`, `.pixel-corners`, `.noise-overlay`, `.crt-lines`, `.section-tag`,
`.text-glow-*`, `.btn-pixel*`, `.grid-overlay`, `.gradient-text`, `.particle`,
`.section-divider`, `.card-hover`, `.pixel-image`, keyframes `pixelLoad`/`particleFloat`,
`::selection`) verbatim dari `ditdev_fe/src/index.css` — ini plain CSS, tidak berubah.
Pertahankan variabel CSS `--bg-primary` dll. di `:root` karena dipakai oleh custom CSS.

> Catatan v4: utility `line-clamp-*`, opacity modifier (`text-pixel-blue/20`), dan arbitrary values
> (`text-[rgba(...)]`, `w-[600px]`) semuanya tetap bekerja. Perhatikan default `border` color di v4
> adalah `currentColor` — audit class `border` tanpa warna (mis. `border-t border-l`) yang
> mengandalkan default v3 (gray-200); di kode ini mayoritas sudah eksplisit warnanya, tinggal cek saat parity test.

---

## 6. Type definitions — `src/types/api.ts`

Berdasarkan bentuk JSON backend (§1):

```ts
export interface ApiResponse<T> { success: boolean; data?: T; count?: number; message?: string }

export interface ProjectLink { type: string; url: string }

export interface Project {
  id: number; title: string; description: string;
  thumbnail: string | null; tags: string[] | null; links: ProjectLink[] | null;
  created_at: string; updated_at: string;
}

export interface Certificate {
  id: number; title: string; provider: string;
  thumbnail: string | null; issue_date: string | null;
  credential_url: string | null; pdf_file: string; created_at: string;
}

export interface Stat {
  id: number; key: string; value: number | null; label: string;
  start_date: string | null; created_at: string; updated_at: string; calculated?: boolean;
}

export interface Admin { id: number; username: string }

export interface AuthResponse { success: boolean; token: string; admin: Admin; expiresIn?: string }

export type ChatRole = 'user' | 'assistant' | 'system';
export interface ChatMessage { id: number; role: ChatRole; content: string }

export interface GitHubEvent {
  id?: string; type?: string; created_at?: string;
  repo?: { name?: string }; payload?: { commits?: { message?: string }[]; description?: string };
}
export interface GitHubActivityData {
  events?: GitHubEvent[]; user?: { public_repos?: number; followers?: number; following?: number };
  repos?: { name?: string; stargazers_count?: number }[];
}
```

---

## 7. Mapping file & panduan konversi per kategori

### 7.1 Services (paling pertama)
- `src/services/api.ts` — port dari `services/api.js`; tambah generic:
  ```ts
  import axios, { AxiosResponse } from 'axios'
  export const api = axios.create({ baseURL: API_URL, timeout: 10000 })
  export const projectsAPI = {
    getAll: (): Promise<AxiosResponse<ApiResponse<Project[]>>> => api.get('/projects'),
    ...
  }
  ```
- `src/admin/services/api.ts` — port fetch-wrapper; buat type `ApiRequestOptions` dan return type per method (`Promise<ApiResponse<Project[]>>`, `Promise<AuthResponse>`, dst.). `uploadImage(file: File, type = 'projects')`, `uploadPDF(file: File)`, `getImageUrl(path?: string | null): string | null`.
- `src/chat-ai/services/chatService.ts` — `sendChatMessage(messages: ChatMessage[], currentSection = ''): Promise<string>`.

### 7.2 Hooks
- `useTypewriter.ts` — parameter `texts: string[]`; gunakan `ReturnType<typeof setTimeout>` untuk timer refs (atau `number` + `window.setTimeout`).
- `useChat.ts` — `ChatMessage[]` state; `nextId` memakai `savedMessages`; refs: `useRef<number | null>(null)` untuk hint timer; `SECTIONS` dan `quickPrompts` sebagai `as const`/typed arrays; `sendMessage(text?: string)`.

### 7.3 Komponen portfolio
Pola umum per file:
1. Ganti ekstensi `.jsx` → `.tsx`.
2. Props yang tidak bertipe (mis. `ProjectCard({ project, index })`, `TagBadge({ tag })`, `CertCard`, `StatPill({ value, label, color })`, `TimelineItem`, `MessageBubble({ message })`) → definisikan interface inline:
   ```tsx
   interface ProjectCardProps { project: Project; index: number }
   ```
3. Canvas (Hero, Skills, KnightRunner, ParallaxBackground): `const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;` — refs `useRef<HTMLCanvasElement>(null)`, anim id `useRef<number>(0)` (pakai `requestAnimationFrame`, bukan `setTimeout`).
4. Event handlers: `onChange` → `ChangeEvent<HTMLInputElement | HTMLTextAreaElement>`, `onSubmit` → `FormEvent<HTMLFormElement>`, keyboard → `KeyboardEvent<HTMLInputElement>`, mouse → `MouseEvent<HTMLCanvasElement>`.
5. framer-motion `variants` object → ketik dengan `Variants` dari `framer-motion` bila perlu.
6. Ikon `react-icons` sudah memiliki tipe; `lucide-react` juga.
7. `import.meta.env.VITE_API_URL` dibaca lewat helper `getApiBase()` di `services/api.ts` agar terpusat.

### 7.4 CHANGLI-AI
- `MarkdownRenderer.tsx` — port `components` map; import `type { Components } from 'react-markdown'` dan beri tipe `const components: Components = {...}`. Helper `fencedCode(children: ReactNode)`; `props.className` diakses setelah guard. Catatan react-markdown v10: prop `inline`, `ordered`, `index` tidak lagi diteruskan (komentar di kode JS sudah menjelaskan) — pertahankan perilaku yang sama.
- `ChangliChat.tsx` — `NpcAvatar({ size = 32, pulse = false })`, `MessageBubble({ message: ChatMessage })`, refs input `useRef<HTMLInputElement>(null)`, bottom `useRef<HTMLDivElement>(null)`.

### 7.5 Admin
- `ThemeContext.tsx` — `createContext<ThemeContextValue | null>(null)`, `useTheme()` throw bila null; `type ThemeMode = 'light' | 'dark' | 'system'`.
- `Login.tsx` — `onLogin: (admin: Admin) => void`; `PARTICLES` array typed; `Particle` props typed.
- `Dashboard.tsx` — `{ admin: Admin; onLogout: () => void }`; `themeIcons` record typed; `Menu` dari `@headlessui/react` sudah typed.
- `ImageCropper.tsx` — gunakan `Crop` / `PixelCrop` dari `react-easy-crop`; `onCropComplete` signature sesuai versi 5.
- `ProjectModal.tsx` / `CertificateModal.tsx` / `StatsManager.tsx` / `ProjectsManager.tsx` / `CertificatesManager.tsx` / `RagManager.tsx` / `RegisterAdmin.tsx` / `DiscardDialog.tsx` / `Portal.tsx` — port biasa + tipe props; payload create/update ikuti bentuk `ProjectRequest`/`CertificateRequest`/`CreateStatRequest` dari backend (§1): field opsional → `Partial<>` / interface tersendiri.

### 7.6 App shell
- `App.tsx` — port `Portfolio`, `SEO` (Helmet), lazy imports (`Projects`, `Certificates`, `GitHubActivity`, `ChangliChat`, `AdminApp`) dengan `lazy(() => import('./components/Projects'))` (tanpa ekstensi — moduleResolution bundler). Preload dengan IntersectionObserver dipertahankan. `IdleManager` tetap komentar.
- `main.tsx` — ganti konten scaffold: `StrictMode` + `BrowserRouter` + `App`; hapus demo App.
- `App.css` scaffold — hapus (styling asli ada di index.css / Tailwind).

### 7.7 Custom
- `NotFound.tsx`, `RightClickGuard.tsx` (`{ children: ReactNode }`), `SectionLoader.tsx` (`{ height?, label? }`), `IdleManager.tsx` — port + tipe props.

---

## 8. Urutan implementasi (fase)

| Fase | Isi | Kriteria selesai |
|---|---|---|
| **0. Tooling** | Install deps, vite.config (proxy + tailwind v4), vite-env.d.ts, index.html (SEO/fonts), hapus demo scaffold | `bun run build` + `bun run lint` lolos di app kosong |
| **1. Design system** | index.css → `@theme` v4 + custom CSS; salin `public/` & `assets/` | Warna/font/animasi kustom terdaftar (`bun run build` lolos) |
| **2. Data layer** | `types/api.ts`, `services/api.ts`, `admin/services/api.ts`, `chat-ai/services/chatService.ts` | Typecheck lolos |
| **3. Portfolio** | hooks → components (Navbar→Footer, Hero, Skills, GitHubActivity) → custom → App shell/routing | Halaman `/` render; parity visual dgn `ditdev_fe` |
| **4. CHANGLI-AI** | useChat, MarkdownRenderer, ChangliChat | Chat berfungsi (localStorage persist, section hints) |
| **5. Admin** | ThemeContext → api → Login → Dashboard → managers/modals | `/admin` login + CRUD berfungsi |
| **6. Polish & parity** | Bandingkan visual vs `ditdev_fe` (screenshot tiap section), cek respons API vs backend | Build + lint + typecheck hijau; tidak ada fitur hilang |

---

## 9. Verifikasi

1. `bun run build` (menjalankan `tsc -b && vite build`) — wajib 0 error TS.
2. `bun run lint` — 0 error ESLint.
3. `bun run dev` + backend `ditdev_be_rust` (port 2817) → tes:
   - `/` semua section + lazy loading + game loading screen
   - `/admin` login → CRUD projects/certificates/stats, upload gambar/PDF, RAG rebuild
   - CHANGLI-AI: kirim pesan, quick prompts, reset, persist localStorage
   - 404 page, right-click guard
4. **Parity check**: jalankan kedua dev server (5173 vs 5174) dan bandingkan tampilan tiap section — terutama warna `pixel-*`, font `pixel`/`mono`, animasi `animate-blink`/`float`, dan class `border` tanpa warna (gotcha v4).

---

## 10. Risiko & gotcha

- **Tailwind v4**: default border color `currentColor` (v3: gray-200) — audit `border` tanpa warna; keyframes harus di dalam `@theme` agar ter-generate; nama utility `--background-image-*`/`--shadow-*` mengikuti konvensi namespace v4.
- **TS strict**: `noUnusedLocals/Parameters` akan menggagalkan build untuk variabel tak terpakai (mis. `<LuInfinity className=... />` di About.jsx yang berupa expression terpisah — hapus saat port).
- **`erasableSyntaxOnly`**: tanpa enum; gunakan union literal.
- **`verbatimModuleSyntax`**: wajib `import type` untuk type-only.
- **Canvas**: semua `getContext` bisa null; jangan sampai `ctx.fillRect` dipanggil pada null (crash runtime).
- **react-markdown v10**: komponen `code` inline vs block dibedakan lewat `pre` (perilaku lama tetap dipertahankan — lihat komentar di MarkdownRenderer.jsx).
- **`scrollbar-thin`**: class custom yang tidak terdefinisi di v3 maupun v4 (no-op) — pertahankan apa adanya atau tambahkan utility kecil di index.css.
- **StrictMode double-render**: effect canvas/game-loop harus punya cleanup yang benar (cancelAnimationFrame, removeEventListener, disconnect ResizeObserver) — sudah ada di kode sumber, jaga saat port.
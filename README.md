# Portfolio Frontend - Rahmat Aditya

Portfolio website dengan tema pixel art subtle dark mode.

## Stack
- **React 18** + **Vite**
- **Tailwind CSS**
- **TypeScripts**
- **Framer Motion** (animasi)
- **React Icons**
- **Axios** (HTTP client)

## Setup

1. Install dependencies:
```bash
bun install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Edit `.env` — isi URL backend kamu:
```
VITE_API_URL=http://localhost:5000/api
```

4. Jalankan dev server:
```bash
bun run dev
```

open in http://localhost:5173

## Build Production
```bash
bun run build
```

## Struktur
```
src/
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx          ← Typewriter animation, star canvas
│   ├── About.tsx         ← Bio, tech stack, code snippet
│   ├── Projects.tsx      ← Fetch dari /api/projects
│   ├── Certificates.tsx  ← Fetch dari /api/certificates, modal
│   ├── Skills.tsx        ← Skill bars, fetch dari /api/stats
│   ├── Contact.tsx       ← Form + social links
│   ├── Footer.tsx        ← Marquee, links
│   └── SectionDivider.tsx
├── hooks/
│   └── useTypewriter.ts  ← Custom hook animasi ketik
├── services/
│   └── api.ts            ← Axios client
├── App.tsx
├── main.tsx
└── index.css             ← Tailwind + custom styles
```

## Fitur
- ✅ Pixel art subtle dark mode (hitam/biru tua)
- ✅ Typewriter animation di hero (loop roles)
- ✅ Star particle canvas background
- ✅ Smooth scroll navigation
- ✅ Fetch projects, certificates, stats dari backend
- ✅ Skill bars dengan animasi
- ✅ Certificate modal dengan PDF viewer
- ✅ Contact form
- ✅ Tech marquee di footer
- ✅ Fully responsive
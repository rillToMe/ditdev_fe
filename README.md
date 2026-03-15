# Portfolio Frontend - Rahmat Aditya

Portfolio website dengan tema pixel art subtle dark mode.

## Stack
- **React 18** + **Vite**
- **Tailwind CSS**
- **Framer Motion** (animasi)
- **React Icons**
- **Axios** (HTTP client)

## Setup

1. Install dependencies:
```bash
npm install
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
npm run dev
```

open in http://localhost:5173

## Build Production
```bash
npm run build
```

## Struktur
```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Hero.jsx          ← Typewriter animation, star canvas
│   ├── About.jsx         ← Bio, tech stack, code snippet
│   ├── Projects.jsx      ← Fetch dari /api/projects
│   ├── Certificates.jsx  ← Fetch dari /api/certificates, modal
│   ├── Skills.jsx        ← Skill bars, fetch dari /api/stats
│   ├── Contact.jsx       ← Form + social links
│   ├── Footer.jsx        ← Marquee, links
│   └── SectionDivider.jsx
├── hooks/
│   └── useTypewriter.js  ← Custom hook animasi ketik
├── services/
│   └── api.js            ← Axios client
├── App.jsx
├── main.jsx
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

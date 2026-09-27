// Single source of truth for identity, navigation, socials and misc constants.
// Previously duplicated across Hero / About / Contact / Footer / Projects.

export const SITE = {
  name: 'Rahmat Aditya',
  firstName: 'Rahmat',
  lastName: 'Aditya',
  handle: '@adit',
  /** Rahmat owns the realm; he is not the one playing it. */
  owner: 'WORLD_OWNER',
  /** The visitor who enters the realm and earns XP/MAP progress. */
  traveler: 'TRAVELER',
  role: 'Game Developer & Web Developer',
  shortRole: 'Game Dev · Web Dev',
  location: 'Sumatera Barat, Indonesia',
  email: 'contact@kyuzenstudio.com',
  url: 'https://ditdev.kyuzenstudio.com',
  version: 'v3.0.0',
  githubUser: 'rillToMe',
} as const

export const NAV_ITEMS = [
  { id: 'home',         label: 'Home',         index: '01', icon: 'home'     },
  { id: 'about',        label: 'About',        index: '02', icon: 'user'     },
  { id: 'projects',     label: 'Projects',     index: '03', icon: 'gamepad'  },
  { id: 'certificates', label: 'Certificates', index: '04', icon: 'trophy'   },
  { id: 'skills',       label: 'Skills',       index: '05', icon: 'star'     },
  { id: 'education',    label: 'Quest Log',    index: '06', icon: 'book'     },
  { id: 'github',       label: 'Activity',     index: '07', icon: 'chart'    },
  { id: 'contact',      label: 'Contact',      index: '08', icon: 'mail'     },
] as const

export type SectionId = (typeof NAV_ITEMS)[number]['id']

/** Zones counted for the HUD "map explored" meter. */
export const EXPLORABLE: readonly SectionId[] = [
  'home', 'about', 'projects', 'certificates', 'skills', 'education', 'github', 'contact',
]

export const SOCIALS = [
  { id: 'github',    label: 'GitHub',    href: 'https://github.com/rillToMe',               value: 'rillToMe' },
  { id: 'tiktok',    label: 'TikTok',    href: 'https://www.tiktok.com/@goodvibes_music28', value: '@goodvibes_music28' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/rill_lyrics/',    value: '@rill_lyrics' },
] as const

export type SocialId = (typeof SOCIALS)[number]['id']

export const TECH_MARQUEE = [
  'Unity', 'Godot', 'React', 'C#', 'Unreal', 'Blender',
  'JavaScript', 'TypeScript', 'Rust', 'Bun', 'GitHub', 'VS Code', 'PostgreSQL', 'HTML/CSS',
] as const

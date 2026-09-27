// Tiny theme helper for the admin console.
// The class lives on <html> so it also reaches modals teleported to <body>.
// Portfolio styles never reference the --a-* tokens, so this is safe.

export type Theme = 'light' | 'dark'

const KEY = 'admin_theme'

export function getStoredTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('admin-light', theme === 'light')
  try { localStorage.setItem(KEY, theme) } catch { /* ignore */ }
}

export function clearTheme() {
  document.documentElement.classList.remove('admin-light')
}

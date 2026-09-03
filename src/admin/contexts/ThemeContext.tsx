/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

type ThemeOption = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: ThemeOption
  resolvedTheme: 'light' | 'dark'
  changeTheme: (newTheme: ThemeOption) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeOption>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = (localStorage.getItem('admin_theme') as ThemeOption | null) || 'system'
    setTheme(savedTheme)
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark')
        setResolvedTheme('dark')
      } else {
        root.classList.remove('dark')
        setResolvedTheme('light')
      }
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      applyTheme(theme === 'dark')
    }
  }, [theme])

  const changeTheme = (newTheme: ThemeOption) => {
    setTheme(newTheme)
    localStorage.setItem('admin_theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
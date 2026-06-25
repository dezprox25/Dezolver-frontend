import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  resolvedTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextValue>({ resolvedTheme: 'light' })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useSettingsStore()

  const resolvedTheme: ResolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  return (
    <ThemeContext.Provider value={{ resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

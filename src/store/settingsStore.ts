import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface SettingsState {
  theme: Theme
  sidebarCollapsed: boolean
  setTheme: (theme: Theme) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'dezolver-settings' }
  )
)

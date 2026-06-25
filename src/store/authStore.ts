import { create } from 'zustand'
import type { User, TenantInfo, SubscriptionInfo, LinkedUser } from '@/types/auth.types'

interface ImpersonatorInfo {
  id: string
  name: string
}

interface AuthState {
  // Core auth
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Extended context fetched from /me
  tenant: TenantInfo | null
  subscription: SubscriptionInfo | null
  linkedUsers: LinkedUser[]

  // Impersonation (set by platform-admin impersonate flow in Phase 4)
  isImpersonating: boolean
  impersonatorInfo: ImpersonatorInfo | null

  // Actions
  setAuth: (user: User, accessToken: string) => void
  setFullAuth: (
    user: User,
    accessToken: string,
    tenant: TenantInfo,
    subscription: SubscriptionInfo,
    linkedUsers: LinkedUser[]
  ) => void
  setAccessToken: (token: string) => void
  updateUser: (partial: Partial<User>) => void
  setImpersonating: (impersonating: boolean, info?: ImpersonatorInfo | null) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  tenant: null,
  subscription: null,
  linkedUsers: [],
  isImpersonating: false,
  impersonatorInfo: null,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  setFullAuth: (user, accessToken, tenant, subscription, linkedUsers) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
      tenant,
      subscription,
      linkedUsers,
    }),

  setAccessToken: (accessToken) => set({ accessToken }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),

  setImpersonating: (isImpersonating, info = null) =>
    set({ isImpersonating, impersonatorInfo: info ?? null }),

  logout: () => {
    // Clear mock/dev sessions so the login page is shown after logout
    if (import.meta.env.VITE_APP_MODE === 'mock') {
      try { localStorage.removeItem('__MOCK_SESSION__') } catch { /* ignore */ }
    }
    if (import.meta.env.DEV) {
      try { sessionStorage.removeItem('__DEV_SESSION__') } catch { /* ignore */ }
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      tenant: null,
      subscription: null,
      linkedUsers: [],
      isImpersonating: false,
      impersonatorInfo: null,
    })
  },

  setLoading: (isLoading) => set({ isLoading }),
}))

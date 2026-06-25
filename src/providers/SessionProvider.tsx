import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/api/auth.service'
import { useAuthStore } from '@/store/authStore'
import { ACCESS_TOKEN_EXPIRY_MS, QUERY_KEYS } from '@/lib/constants'
import { normalizeMeResponse } from '@/types/auth.types'

interface SessionProviderProps {
  children: ReactNode
}

/**
 * SessionProvider runs once on mount and:
 * 1. Attempts to restore an active session using the httpOnly refresh cookie.
 * 2. After successful restore/login, schedules a proactive token refresh
 *    60 s before the 15-min access token expires.
 *
 * It does NOT wrap the router — it lives inside <Providers> and above <RouterProvider>.
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const { setFullAuth, setLoading, logout, setAccessToken, isAuthenticated, accessToken } =
    useAuthStore()
  const queryClient = useQueryClient()
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Session restore on mount ─────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      // MOCK MODE: Restore session from localStorage (works in both dev and prod)
      if (import.meta.env.VITE_APP_MODE === 'mock' || import.meta.env.DEV) {
        // Try mock session (production demo) first
        if (import.meta.env.VITE_APP_MODE === 'mock') {
          const { loadMockSession } = await import('@/mock/mockPersonas')
          const persona = loadMockSession()
          if (persona) {
            setFullAuth(persona.user, `MOCK_TOKEN_${persona.key}`, persona.tenant, persona.subscription, [])
            return
          }
          setLoading(false)
          return
        }
        // DEV fallback: Restore a mock session from sessionStorage
        const { loadDevSession } = await import('@/lib/dev/mockUsers')
        const persona = loadDevSession()
        if (persona) {
          setFullAuth(
            persona.user,
            'DEV_ACCESS_TOKEN',
            persona.tenant,
            persona.subscription,
            []
          )
          return
        }
      }

      // Step 1: Try to get a fresh access token via the refresh cookie.
      // Uses raw axios internally (no interceptor loop risk).
      const newToken = await authService.tryRefresh()

      if (!newToken) {
        // No valid session — allow the app to render the login page.
        setLoading(false)
        return
      }

      // Step 2: Store the token so apiClient can use it for the /me call.
      setAccessToken(newToken)

      try {
        // Step 3: Fetch full user context.
        const me = await authService.getFullProfile()
        const user = normalizeMeResponse(me)
        setFullAuth(user, newToken, me.tenant, me.subscription, me.linkedUsers)
        // Prime the TanStack Query cache with the user data.
        queryClient.setQueryData(QUERY_KEYS.ME, me)
      } catch {
        // /me failed — token was valid but profile fetch failed.
        // Mark as not authenticated so the user is sent to login.
        logout()
      }
    }

    restore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally run only once on mount.

  // ── Proactive token refresh ──────────────────────────────────────────────
  useEffect(() => {
    if (import.meta.env.VITE_APP_MODE === 'mock') return
    if (!isAuthenticated || !accessToken) return

    // Clear any existing timer when the token changes.
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)

    refreshTimerRef.current = setTimeout(async () => {
      const newToken = await authService.tryRefresh()
      if (newToken) {
        setAccessToken(newToken)
      } else {
        // Refresh failed — session truly expired.
        logout()
        queryClient.clear()
        window.location.href = '/login'
      }
    }, ACCESS_TOKEN_EXPIRY_MS)

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [accessToken, isAuthenticated, setAccessToken, logout, queryClient])

  return <>{children}</>
}

import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/api/auth.service'
import { useAuthStore } from '@/store/authStore'
import { normalizeMeResponse } from '@/types/auth.types'
import type { UserRole } from '@/types/auth.types'
import { QUERY_KEYS } from '@/lib/constants'
import { ROLE_PERMISSIONS } from '@/lib/permissions/roles'

/**
 * Fetches and caches the full /me profile.
 * Keeps the auth store in sync when fresh data arrives.
 * Only runs when the user is authenticated.
 */
export function useCurrentUserQuery() {
  const { isAuthenticated, accessToken, setFullAuth } = useAuthStore()

  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: async () => {
      const me = await authService.getFullProfile()
      const user = normalizeMeResponse(me)
      const currentToken = accessToken!
      setFullAuth(user, currentToken, me.tenant, me.subscription, me.linkedUsers)
      return me
    },
    enabled: isAuthenticated && !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: true,
  })
}

/**
 * Returns the current user's effective permissions and roles using TanStack Query.
 * Shares the same QUERY_KEYS.ME cache — no extra network request.
 * The select function derives permissions from roles at query time.
 */
export function usePermissionsQuery() {
  const { isAuthenticated, accessToken, setFullAuth } = useAuthStore()

  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: async () => {
      const me = await authService.getFullProfile()
      const user = normalizeMeResponse(me)
      const currentToken = accessToken!
      setFullAuth(user, currentToken, me.tenant, me.subscription, me.linkedUsers)
      return me
    },
    enabled: isAuthenticated && !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: true,
    select: (me) => {
      const roles = me.user.roles as UserRole[]
      const permissions = [
        ...new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? [])),
      ]
      return {
        roles,
        permissions,
        hasPermission: (permission: string) =>
          roles.some((role) => {
            const perms = ROLE_PERMISSIONS[role] ?? []
            return perms.includes('*') || perms.includes(permission)
          }),
        hasRole: (required: UserRole[]) => required.some((r) => roles.includes(r)),
      }
    },
  })
}

/** Returns the user from the auth store directly (no fetch). */
export function useCurrentUser() {
  return useAuthStore((s) => s.user)
}

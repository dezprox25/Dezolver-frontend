import { useAuthStore } from '@/store/authStore'
import { hasRole } from '@/lib/permissions/roles'
import type { UserRole } from '@/types/auth.types'

/** Returns true if the authenticated user has at least one of the required roles. */
export function useRoles(roles: UserRole[]): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  return hasRole(user.roles, roles)
}

/** Returns the current user's primary role or null. */
export function usePrimaryRole(): UserRole | null {
  return useAuthStore((s) => s.user?.primaryRole ?? null)
}

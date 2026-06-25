import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions/roles'

/**
 * Returns true if the authenticated user holds the given permission string.
 * Mirrors the backend ROLE_PERMISSIONS map; platform_admin always returns true.
 */
export function usePermissions(permission: string): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  return hasPermission(user.roles, permission)
}

/** Returns true if the user holds ALL of the given permissions. */
export function useAllPermissions(permissions: string[]): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  return permissions.every((p) => hasPermission(user.roles, p))
}

/** Returns true if the user holds ANY of the given permissions. */
export function useAnyPermission(permissions: string[]): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  return permissions.some((p) => hasPermission(user.roles, p))
}

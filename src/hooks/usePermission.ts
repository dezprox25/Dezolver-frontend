import { useAuthStore } from '@/store/authStore'
import { hasPermission, hasRole } from '@/lib/permissions/roles'
import type { UserRole } from '@/types/auth.types'

export function usePermission(permission: string): boolean {
  const { user } = useAuthStore()
  if (!user) return false
  return hasPermission(user.roles, permission)
}

export function useRole(roles: UserRole[]): boolean {
  const { user } = useAuthStore()
  if (!user) return false
  return hasRole(user.roles, roles)
}

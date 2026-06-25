import type { ReactNode } from 'react'
import type { UserRole } from '@/types/auth.types'
import { useAuthStore } from '@/store/authStore'
import { hasRole } from '@/lib/permissions/roles'

interface RoleGateProps {
  roles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { user } = useAuthStore()

  if (!user) return <>{fallback}</>

  const allowed = hasRole(user.roles, roles)

  return allowed ? <>{children}</> : <>{fallback}</>
}

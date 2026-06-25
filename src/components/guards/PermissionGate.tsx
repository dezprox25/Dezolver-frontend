import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions/roles'

interface PermissionGateProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { user } = useAuthStore()

  if (!user) return <>{fallback}</>

  const allowed = hasPermission(user.roles, permission)

  return allowed ? <>{children}</> : <>{fallback}</>
}

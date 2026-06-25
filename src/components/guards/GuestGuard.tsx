import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoadingState } from '@/components/shared/LoadingState'

interface GuestGuardProps {
  children: ReactNode
}

/**
 * Prevents authenticated users from visiting guest-only pages (login, signup, etc.).
 * While the session is being restored (isLoading), shows a loading screen to
 * prevent a flash of the login page for users who already have a valid session.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

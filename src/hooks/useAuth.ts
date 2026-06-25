import { useAuthStore } from '@/store/authStore'
import { ROLE_LABELS } from '@/lib/permissions/roles'
import type { UserRole } from '@/types/auth.types'

export function useAuth() {
  const { user, isAuthenticated, isLoading, tenant, subscription, linkedUsers } = useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    tenant,
    subscription,
    linkedUsers,
    planCode: subscription?.planCode ?? null,
    roleLabel: user ? ROLE_LABELS[user.primaryRole] : null,
    isStudent: user?.primaryRole === 'student',
    isFaculty: user?.primaryRole === 'faculty',
    isCoordinator: user?.primaryRole === 'coordinator',
    isCollegeAdmin: user?.primaryRole === 'college_admin',
    isPlatformAdmin: user?.primaryRole === 'platform_admin',
    isPlatformModerator: user?.primaryRole === 'platform_moderator',
    isContentManager: user?.primaryRole === 'content_manager',
    /** True for any platform-level role */
    isPlatformStaff:
      user?.primaryRole === 'platform_admin' ||
      user?.primaryRole === 'platform_moderator' ||
      user?.primaryRole === 'content_manager',
    hasRole: (roles: UserRole[]) => roles.includes(user?.primaryRole ?? ('' as UserRole)),
  }
}

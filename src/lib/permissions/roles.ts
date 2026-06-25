import type { UserRole } from '@/types/auth.types'

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  coordinator: 'Coordinator',
  college_admin: 'College Admin',
  content_manager: 'Content Manager',
  platform_moderator: 'Platform Moderator',
  platform_admin: 'Platform Admin',
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  student: [
    'read:cohort',
    'read:course',
    'read:path',
    'read:problem',
    'create:submission',
    'read:event',
    'register:event',
    'read:own-certificates',
    'fork:path',
  ],
  faculty: [
    'read:cohort',
    'read:course',
    'read:path',
    'read:problem',
    'create:submission',
    'read:event',
    'create:assessment',
    'read:assessment',
    'manage:assessment',
    'create:event:cohort',
    'view:submission',
    'rerun:submission',
    'review:flagged-submission',
    'read:own-certificates',
  ],
  coordinator: [
    'read:cohort',
    'manage:cohort',
    'read:course',
    'read:path',
    'author:path:curated',
    'read:problem',
    'read:event',
    'manage:event',
    'create:event:cohort',
    'create:assessment',
    'manage:assessment',
    'read:own-certificates',
  ],
  college_admin: [
    'manage:cohort',
    'manage:course',
    'manage:path',
    'manage:assessment',
    'manage:event',
    'create:event:tenant',
    'create:event:tenant_open',
    'manage:user',
    'manage:tenant',
    'read:billing',
    'manage:certificate',
    'read:audit',
    'view:submission',
    'review:flagged-submission',
    'revoke:certificate',
    'manage:template:tenant',
    'manage:issuance-rule',
    'curate:overlay',
    'activate:overlay',
    'upload:media',
    'read:own-certificates',
    'view:payouts',
  ],
  content_manager: [
    'create:content',
    'publish:content',
    'manage:problem',
    'manage:course',
    'manage:curriculum',
    'manage:path',
    'author:path:default',
    'author:syllabus',
    'publish:syllabus',
    'import:content',
    'manage:template:platform',
    'upload:media',
    'read:own-certificates',
  ],
  platform_moderator: [
    'read:tenant',
    'read:user',
    'manage:event',
    'platform:manage_flags',
    'read:audit',
    'read:own-certificates',
  ],
  platform_admin: ['*'],
}

export function hasPermission(roles: UserRole[], permission: string): boolean {
  return roles.some((role) => {
    const perms = ROLE_PERMISSIONS[role] ?? []
    return perms.includes('*') || perms.includes(permission)
  })
}

export function hasRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some((r) => userRoles.includes(r))
}

export const PLATFORM_ROLES: UserRole[] = ['platform_admin', 'platform_moderator', 'content_manager']
export const TENANT_ADMIN_ROLES: UserRole[] = ['college_admin', 'coordinator']
export const STAFF_ROLES: UserRole[] = ['faculty', 'coordinator', 'college_admin']

import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ROLE_LABELS, ROLE_PERMISSIONS } from '@/lib/permissions/roles'
import type { UserRole } from '@/types/auth.types'

// ─── Permission categories for display ───────────────────────────────────────

const PERMISSION_GROUPS: { label: string; permissions: string[] }[] = [
  {
    label: 'Learning Content',
    permissions: [
      'read:course',
      'read:path',
      'read:problem',
      'fork:path',
      'read:cohort',
    ],
  },
  {
    label: 'Submissions & Assessment',
    permissions: [
      'create:submission',
      'create:assessment',
      'read:assessment',
      'manage:assessment',
      'view:submission',
      'rerun:submission',
      'review:flagged-submission',
    ],
  },
  {
    label: 'Events',
    permissions: [
      'read:event',
      'register:event',
      'create:event:cohort',
      'create:event:tenant',
      'create:event:tenant_open',
      'manage:event',
    ],
  },
  {
    label: 'Credentials',
    permissions: [
      'read:own-certificates',
      'manage:certificate',
      'revoke:certificate',
      'manage:template:tenant',
      'manage:template:platform',
      'manage:issuance-rule',
    ],
  },
  {
    label: 'Curriculum & Content',
    permissions: [
      'manage:curriculum',
      'author:syllabus',
      'publish:syllabus',
      'curate:overlay',
      'activate:overlay',
      'create:content',
      'publish:content',
      'manage:problem',
      'manage:course',
      'manage:path',
      'author:path:default',
      'author:path:curated',
      'import:content',
      'upload:media',
    ],
  },
  {
    label: 'Tenant & Users',
    permissions: [
      'manage:cohort',
      'manage:user',
      'manage:tenant',
      'read:billing',
      'view:payouts',
      'read:audit',
    ],
  },
  {
    label: 'Platform',
    permissions: [
      'read:tenant',
      'read:user',
      'platform:manage_flags',
      'platform:manage_tenants',
      'platform:impersonate',
    ],
  },
]

const ALL_ROLES: UserRole[] = [
  'student',
  'faculty',
  'coordinator',
  'college_admin',
  'content_manager',
  'platform_moderator',
  'platform_admin',
]

function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? []
  return perms.includes('*') || perms.includes(permission)
}

interface PermissionMatrixProps {
  highlightRole?: UserRole
  /** If true, only shows groups with at least one granted permission */
  compact?: boolean
}

export function PermissionMatrix({ highlightRole, compact }: PermissionMatrixProps) {
  const roles = ALL_ROLES

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2.5 text-left font-medium w-48">Permission</th>
            {roles.map((role) => (
              <th
                key={role}
                className={cn(
                  'px-3 py-2.5 text-center font-medium text-xs whitespace-nowrap',
                  highlightRole === role && 'bg-primary/10 text-primary'
                )}
              >
                {ROLE_LABELS[role]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_GROUPS.map((group) => {
            const visiblePerms = compact
              ? group.permissions.filter((p) => roles.some((r) => hasPermission(r, p)))
              : group.permissions

            if (visiblePerms.length === 0) return null

            return (
              <>
                <tr key={group.label} className="border-b bg-muted/20">
                  <td
                    colSpan={roles.length + 1}
                    className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {group.label}
                  </td>
                </tr>
                {visiblePerms.map((permission) => (
                  <tr key={permission} className="border-b hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-2 text-xs font-mono text-muted-foreground">
                      {permission}
                    </td>
                    {roles.map((role) => {
                      const granted = hasPermission(role, permission)
                      return (
                        <td
                          key={role}
                          className={cn(
                            'px-3 py-2 text-center',
                            highlightRole === role && 'bg-primary/5'
                          )}
                        >
                          {granted ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                          ) : (
                            <Minus className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

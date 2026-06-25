import { useState } from 'react'
import { Shield, Info } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { PermissionMatrix } from '@/components/admin/PermissionMatrix'
import { RoleBadge } from '@/components/admin/RoleBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ROLE_LABELS, ROLE_PERMISSIONS } from '@/lib/permissions/roles'
import type { UserRole } from '@/types/auth.types'

const ALL_ROLES: UserRole[] = [
  'student',
  'faculty',
  'coordinator',
  'college_admin',
  'content_manager',
  'platform_moderator',
  'platform_admin',
]

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  student: 'Enrolled learner — consumes content, submits assessments, participates in events.',
  faculty: 'Instructor — creates assessments, runs workshops, tracks cohort progress.',
  coordinator: 'Program coordinator — manages cohorts, curates learning paths, schedules events.',
  college_admin: 'Full institution administrator — manages users, billing, curriculum, and configuration.',
  content_manager: 'Dezprox team — authors and publishes platform-level curriculum, rooms, and problems.',
  platform_moderator: 'Dezprox support — read-only oversight, feature flag management, event moderation.',
  platform_admin: 'Platform superuser — full access to all tenants, users, billing, and security controls.',
}

export function RolesPage() {
  const [highlightRole, setHighlightRole] = useState<UserRole | undefined>(undefined)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles &amp; Permissions"
        description="Read-only view of the platform's role-based access control (RBAC) model."
      />

      {/* Note card */}
      <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Roles and permissions are defined in the platform's RBAC model and mirror the backend
          exactly. Role assignment happens through the invitation flow; permissions are not
          individually configurable per user.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_ROLES.map((role) => {
          const perms = ROLE_PERMISSIONS[role] ?? []
          const count = perms.includes('*') ? '∞' : perms.length

          return (
            <Card
              key={role}
              className={`cursor-pointer transition-all hover:shadow-sm ${
                highlightRole === role ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() =>
                setHighlightRole((prev) => (prev === role ? undefined : role))
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <RoleBadge role={role} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setHighlightRole((prev) => (prev === role ? undefined : role))
                    }}
                  >
                    {highlightRole === role ? 'Clear' : 'Highlight'}
                  </Button>
                </div>
                <CardTitle className="text-sm font-medium pt-1">
                  {ROLE_LABELS[role]}
                </CardTitle>
                <CardDescription className="text-xs leading-snug">
                  {ROLE_DESCRIPTIONS[role]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  <span>
                    {count === '∞' ? 'All permissions (superuser)' : `${count} permissions`}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Permission matrix */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Permission Matrix</h2>
        <p className="text-sm text-muted-foreground">
          {highlightRole
            ? `Showing permissions for: ${ROLE_LABELS[highlightRole]}`
            : 'Click a role card above to highlight its permissions.'}
        </p>
        <ScrollArea className="w-full">
          <PermissionMatrix highlightRole={highlightRole} />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Info } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { PermissionMatrix } from '@/components/admin/PermissionMatrix'
import { RoleBadge } from '@/components/admin/RoleBadge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROLE_LABELS } from '@/lib/permissions/roles'
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

export function PermissionsPage() {
  const [highlightRole, setHighlightRole] = useState<UserRole | 'all'>('all')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="Full permission matrix for all platform roles."
      />

      <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Permissions are defined in the platform RBAC model and enforced server-side. Individual
          permission overrides per user are not supported — all permissions derive from the assigned
          role.
        </p>
      </div>

      {/* Role filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Filter by role:</span>
        <Select
          value={highlightRole}
          onValueChange={(v) => setHighlightRole(v as UserRole | 'all')}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ALL_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                <div className="flex items-center gap-2">
                  <RoleBadge role={role} />
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {highlightRole !== 'all' && (
          <span className="text-sm text-muted-foreground">
            Showing permissions for: <span className="font-medium">{ROLE_LABELS[highlightRole]}</span>
          </span>
        )}
      </div>

      <ScrollArea className="w-full">
        <PermissionMatrix highlightRole={highlightRole === 'all' ? undefined : highlightRole} />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

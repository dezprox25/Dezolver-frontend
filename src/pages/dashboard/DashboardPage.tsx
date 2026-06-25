import {
  BookOpen, Users, FileText, Trophy, GraduationCap,
  Building2, Code2, Layers, Calendar, BarChart3, Flag,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats, useDashboardActivity } from '@/hooks/useDashboard'
import { DashboardWidget } from '@/components/dashboard/DashboardWidget'
import { DashboardGrid, GridItem } from '@/components/dashboard/DashboardGrid'
import { StatCard } from '@/components/dashboard/cards/StatCard'
import { KpiRowSkeleton } from '@/components/dashboard/WidgetSkeleton'
import { ActivityTimeline } from '@/components/dashboard/activity/ActivityTimeline'
import { QuickActionGrid } from '@/components/dashboard/actions/QuickActionGrid'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import type { QuickAction } from '@/types/dashboard.types'
import type { UserRole } from '@/types/auth.types'

// ─── Role-based quick actions ─────────────────────────────────────────────────

const QUICK_ACTIONS: Partial<Record<UserRole, QuickAction[]>> = {
  student: [
    { id: 'paths', label: 'My Learning Paths', description: 'Continue from where you left off', icon: BookOpen, href: '/paths', comingSoon: true },
    { id: 'problems', label: 'Practice Problems', description: 'Sharpen your coding skills', icon: Code2, href: '/catalog/problems', comingSoon: true },
    { id: 'events', label: 'Upcoming Events', description: 'Competitions and workshops near you', icon: Trophy, href: '/events', comingSoon: true },
    { id: 'certs', label: 'My Certificates', description: 'Download and share your credentials', icon: GraduationCap, href: '/me/certificates', comingSoon: true },
  ],
  faculty: [
    { id: 'assessments', label: 'My Assessments', description: 'Review and manage your assessments', icon: FileText, href: '/assessments', comingSoon: true },
    { id: 'events', label: 'Events', description: 'Workshops and competitions you host', icon: Calendar, href: '/events', comingSoon: true },
    { id: 'students', label: 'Student Progress', description: 'Track cohort performance', icon: Users, href: '/tenant/users', comingSoon: true },
  ],
  coordinator: [
    { id: 'cohorts', label: 'My Cohorts', description: 'Manage student groups', icon: Users, href: '/tenant/cohorts', comingSoon: true },
    { id: 'paths', label: 'Curated Paths', description: 'Build custom learning paths', icon: BookOpen, href: '/paths', comingSoon: true },
    { id: 'assessments', label: 'Assessments', description: 'Schedule and review assessments', icon: FileText, href: '/assessments', comingSoon: true },
  ],
  college_admin: [
    { id: 'users', label: 'Manage Users', description: 'Students, faculty, and staff', icon: Users, href: '/tenant/users', comingSoon: true },
    { id: 'cohorts', label: 'Cohorts', description: 'Organize students into groups', icon: Layers, href: '/tenant/cohorts', comingSoon: true },
    { id: 'curriculum', label: 'Curriculum', description: 'Customize your syllabus overlay', icon: BarChart3, href: '/tenant/curriculum/overlays', comingSoon: true },
    { id: 'billing', label: 'Billing', description: 'Subscription and invoice management', icon: Building2, href: '/billing', comingSoon: true },
  ],
  content_manager: [
    { id: 'rooms', label: 'Manage Rooms', description: 'Author and publish learning rooms', icon: BookOpen, href: '/platform/content/rooms', comingSoon: true },
    { id: 'problems', label: 'Manage Problems', description: 'Create and test coding problems', icon: Code2, href: '/platform/content/problems', comingSoon: true },
    { id: 'syllabi', label: 'Syllabi', description: 'Maintain platform curriculum', icon: Layers, href: '/platform/curriculum/syllabi', comingSoon: true },
  ],
  platform_moderator: [
    { id: 'tenants', label: 'Tenants', description: 'View college accounts', icon: Building2, href: '/platform/tenants', comingSoon: true },
    { id: 'flags', label: 'Feature Flags', description: 'Manage platform features', icon: Flag, href: '/platform/flags', comingSoon: true },
  ],
  platform_admin: [
    { id: 'tenants', label: 'Tenants', description: 'Create and manage colleges', icon: Building2, href: '/platform/tenants', comingSoon: true },
    { id: 'users', label: 'Users & Persons', description: 'Platform-wide user management', icon: Users, href: '/platform/users', comingSoon: true },
    { id: 'flags', label: 'Feature Flags', description: 'Enable / disable per-tenant features', icon: Flag, href: '/platform/flags', comingSoon: true },
    { id: 'billing', label: 'Billing', description: 'Plans, payouts, and refunds', icon: Building2, href: '/platform/billing', comingSoon: true },
  ],
}

// ─── KPI Row ──────────────────────────────────────────────────────────────────

function KpiRow() {
  const { data, isLoading, isError, refetch } = useDashboardStats()

  if (isLoading) return <KpiRowSkeleton count={4} />

  if (isError || !data) {
    return (
      <DashboardWidget
        title="Statistics"
        isError
        errorMessage="Could not load KPIs"
        onRetry={() => refetch()}
      >
        {null}
      </DashboardWidget>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {data.kpis.map((kpi) => (
        <StatCard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          icon={kpi.icon}
          change={kpi.change}
          changeType={kpi.changeType}
        />
      ))}
    </div>
  )
}

// ─── Activity Widget ──────────────────────────────────────────────────────────

function ActivityWidget() {
  const { data, isLoading, isError, refetch } = useDashboardActivity()

  return (
    <DashboardWidget
      title="Recent Activity"
      description="Your latest actions on the platform"
      icon={BarChart3}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Could not load activity"
      onRetry={() => refetch()}
      isEmpty={!isLoading && !isError && (!data || data.length === 0)}
      emptyMessage="No recent activity — get started by exploring your learning paths."
    >
      {data && <ActivityTimeline items={data} />}
    </DashboardWidget>
  )
}

// ─── Quick Actions Widget ─────────────────────────────────────────────────────

function QuickActionsWidget({ role }: { role: UserRole }) {
  const actions = QUICK_ACTIONS[role] ?? []

  return (
    <DashboardWidget title="Quick Actions" description="Common tasks for your role" icon={Trophy}>
      <QuickActionGrid actions={actions} />
    </DashboardWidget>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user, roleLabel, tenant } = useAuth()

  const firstName = user?.fullName?.split(' ')[0] ?? 'there'
  const role: UserRole = user?.primaryRole ?? 'student'

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening across your workspace today."
        actions={
          <div className="flex items-center gap-2">
            {tenant?.name && (
              <Badge variant="outline">{tenant.name}</Badge>
            )}
            <Badge variant="secondary">{roleLabel ?? 'Loading…'}</Badge>
          </div>
        }
      />

      {/* KPI row */}
      <ErrorBoundary>
        <KpiRow />
      </ErrorBoundary>

      {/* Main content grid */}
      <ErrorBoundary>
        <DashboardGrid cols={3}>
          {/* Activity feed — 2 cols */}
          <GridItem span={2}>
            <ActivityWidget />
          </GridItem>

          {/* Quick actions — 1 col */}
          <GridItem span={1}>
            <QuickActionsWidget role={role} />
          </GridItem>
        </DashboardGrid>
      </ErrorBoundary>
    </div>
  )
}

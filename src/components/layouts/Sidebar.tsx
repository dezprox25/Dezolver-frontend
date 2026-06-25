import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  // Student
  BookOpen,
  Trophy,
  Medal,
  // Faculty
  FileText,
  Users,
  Calendar,
  // College Admin
  Building2,
  CreditCard,
  BarChart3,
  // Content + Search
  Search,
  Image,
  Layers,
  Code2,
  // Platform Admin
  Activity,
  Globe,
  Flag,
  ShieldCheck,
  // Misc
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthStore } from '@/store/authStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ROLE_LABELS } from '@/lib/permissions/roles'
import { formatInitials } from '@/lib/utils/format'
import type { UserRole } from '@/types/auth.types'
import type { LucideIcon } from 'lucide-react'

// ─── Nav item definition ──────────────────────────────────────────────────────

interface NavItem {
  label: string
  icon: LucideIcon
  path: string
  /** Coming-soon items are visible but not clickable */
  comingSoon?: boolean
  /** Badge text shown next to label (e.g. "3" for flagged count) */
  badge?: string | number
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

// ─── Role-based navigation registry ──────────────────────────────────────────

const NAV_REGISTRY: Record<UserRole, NavGroup[]> = {
  student: [
    {
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }],
    },
    {
      label: 'Learn',
      items: [
        { label: 'My Syllabus', icon: Layers, path: '/me/syllabus' },
        { label: 'My Paths', icon: BookOpen, path: '/paths' },
        { label: 'Rooms', icon: BookOpen, path: '/content/rooms' },
        { label: 'Courses', icon: Layers, path: '/content/courses' },
        { label: 'Problems', icon: Code2, path: '/content/problems' },
        { label: 'Assessments', icon: FileText, path: '/assessments' },
      ],
    },
    {
      label: 'My Activity',
      items: [
        { label: 'My Submissions', icon: Code2, path: '/submissions' },
        { label: 'Events', icon: Trophy, path: '/events' },
        { label: 'Leaderboard', icon: Medal, path: '/leaderboard' },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Certificates', icon: GraduationCap, path: '/me/certificates' },
        { label: 'Roles & Permissions', icon: ShieldCheck, path: '/roles' },
        { label: 'Settings', icon: Settings, path: '/settings' },
      ],
    },
  ],

  faculty: [
    {
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }],
    },
    {
      label: 'Content',
      items: [
        { label: 'Rooms', icon: BookOpen, path: '/content/rooms' },
        { label: 'Courses', icon: Layers, path: '/content/courses' },
        { label: 'Problems', icon: Code2, path: '/content/problems' },
      ],
    },
    {
      label: 'Teach',
      items: [
        { label: 'Assessments', icon: FileText, path: '/assessments' },
        { label: 'Submissions', icon: Code2, path: '/submissions' },
        { label: 'Flagged', icon: Flag, path: '/submissions/flagged' },
      ],
    },
    {
      label: 'Manage',
      items: [
        { label: 'Events', icon: Calendar, path: '/events' },
        { label: 'Students', icon: Users, path: '/tenant/users' },
      ],
    },
    {
      label: 'Account',
      items: [{ label: 'Settings', icon: Settings, path: '/settings' }],
    },
  ],

  coordinator: [
    {
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }],
    },
    {
      label: 'Manage',
      items: [
        { label: 'Cohorts', icon: Users, path: '/tenant/cohorts' },
        { label: 'Invitations', icon: UserCircle, path: '/tenant/invitations' },
      ],
    },
    {
      label: 'Content',
      items: [
        { label: 'Learning Paths', icon: BookOpen, path: '/paths' },
        { label: 'Curriculum', icon: Layers, path: '/tenant/curriculum/overlays' },
      ],
    },
    {
      label: 'Activity',
      items: [
        { label: 'Assessments', icon: FileText, path: '/assessments' },
        { label: 'Submissions', icon: Code2, path: '/submissions' },
        { label: 'Events', icon: Calendar, path: '/events' },
      ],
    },
    {
      label: 'Account',
      items: [{ label: 'Settings', icon: Settings, path: '/settings' }],
    },
  ],

  college_admin: [
    {
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }],
    },
    {
      label: 'Institution',
      items: [
        { label: 'Overview', icon: Building2, path: '/tenant/overview' },
        { label: 'Users', icon: Users, path: '/tenant/users' },
        { label: 'Cohorts', icon: Users, path: '/tenant/cohorts' },
        { label: 'Invitations', icon: UserCircle, path: '/tenant/invitations' },
      ],
    },
    {
      label: 'Academic',
      items: [
        { label: 'Curriculum', icon: Layers, path: '/tenant/curriculum/overlays' },
        { label: 'Learning Paths', icon: BookOpen, path: '/paths' },
        { label: 'Assessments', icon: FileText, path: '/assessments' },
        { label: 'Submissions', icon: Code2, path: '/submissions' },
        { label: 'Flagged', icon: Flag, path: '/submissions/flagged' },
        { label: 'Events', icon: Calendar, path: '/events' },
        { label: 'Certificates', icon: GraduationCap, path: '/platform/credentials' },
      ],
    },
    {
      label: 'Admin',
      items: [
        { label: 'Roles', icon: ShieldCheck, path: '/roles' },
        { label: 'Permissions', icon: ShieldCheck, path: '/permissions' },
        { label: 'Billing', icon: CreditCard, path: '/billing' },
        { label: 'Reports', icon: BarChart3, path: '/reports', comingSoon: true },
        { label: 'Settings', icon: Settings, path: '/settings' },
      ],
    },
  ],

  content_manager: [
    {
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }],
    },
    {
      label: 'Curriculum',
      items: [
        { label: 'Syllabi', icon: Layers, path: '/curriculum/syllabi' },
        { label: 'Domains', icon: Globe, path: '/platform/curriculum/domains', comingSoon: true },
      ],
    },
    {
      label: 'Content',
      items: [
        { label: 'Rooms', icon: BookOpen, path: '/content/rooms' },
        { label: 'Courses', icon: Layers, path: '/content/courses' },
        { label: 'Problems', icon: Code2, path: '/content/problems' },
        { label: 'Assessments', icon: FileText, path: '/assessments' },
        { label: 'Media Library', icon: Image, path: '/content/media' },
        { label: 'Search', icon: Search, path: '/search' },
      ],
    },
    {
      label: 'Paths',
      items: [
        { label: 'Default Paths', icon: BookOpen, path: '/paths' },
        { label: 'Career Maps', icon: Medal, path: '/career-maps' },
      ],
    },
    {
      label: 'Credentials',
      items: [
        { label: 'Templates', icon: GraduationCap, path: '/platform/credentials/templates' },
        { label: 'Issuance Rules', icon: ShieldCheck, path: '/platform/credentials/rules' },
      ],
    },
    {
      label: 'Account',
      items: [{ label: 'Settings', icon: Settings, path: '/settings' }],
    },
  ],

  platform_moderator: [
    {
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }],
    },
    {
      label: 'Platform',
      items: [
        { label: 'Overview', icon: LayoutDashboard, path: '/platform' },
        { label: 'Tenants', icon: Building2, path: '/platform/tenants' },
        { label: 'Analytics', icon: BarChart3, path: '/platform/analytics' },
      ],
    },
    {
      label: 'Compliance',
      items: [
        { label: 'Audit Log', icon: ShieldCheck, path: '/platform/audit' },
        { label: 'Events', icon: Calendar, path: '/events' },
      ],
    },
    {
      label: 'Account',
      items: [{ label: 'Settings', icon: Settings, path: '/settings' }],
    },
  ],

  platform_admin: [
    {
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }],
    },
    {
      label: 'Tenants',
      items: [
        { label: 'All Tenants', icon: Building2, path: '/platform/tenants' },
        { label: 'Persons', icon: Users, path: '/platform/persons' },
      ],
    },
    {
      label: 'Content',
      items: [
        { label: 'Rooms', icon: BookOpen, path: '/content/rooms' },
        { label: 'Courses', icon: Layers, path: '/content/courses' },
        { label: 'Problems', icon: Code2, path: '/content/problems' },
        { label: 'Assessments', icon: FileText, path: '/assessments' },
        { label: 'Media Library', icon: Image, path: '/content/media' },
        { label: 'Search', icon: Search, path: '/search' },
      ],
    },
    {
      label: 'Judge',
      items: [
        { label: 'Submissions', icon: Code2, path: '/submissions' },
        { label: 'Flagged', icon: Flag, path: '/submissions/flagged' },
      ],
    },
    {
      label: 'Events',
      items: [
        { label: 'All Events', icon: Calendar, path: '/events' },
        { label: 'Leaderboard', icon: Medal, path: '/leaderboard' },
      ],
    },
    {
      label: 'Credentials',
      items: [
        { label: 'Certificates', icon: GraduationCap, path: '/platform/credentials' },
        { label: 'Templates', icon: GraduationCap, path: '/platform/credentials/templates' },
        { label: 'Issuance Rules', icon: ShieldCheck, path: '/platform/credentials/rules' },
      ],
    },
    {
      label: 'Platform',
      items: [
        { label: 'Overview', icon: LayoutDashboard, path: '/platform' },
        { label: 'Analytics', icon: BarChart3, path: '/platform/analytics' },
        { label: 'Feature Flags', icon: Flag, path: '/platform/flags' },
        { label: 'Audit Log', icon: ShieldCheck, path: '/platform/audit' },
        { label: 'System Health', icon: Activity, path: '/platform/health' },
        { label: 'Billing / Plans', icon: CreditCard, path: '/platform/billing' },
      ],
    },
    {
      label: 'Account',
      items: [{ label: 'Settings', icon: Settings, path: '/settings' }],
    },
  ],
}

// ─── Nav Item Component ───────────────────────────────────────────────────────

interface SidebarNavItemProps {
  item: NavItem
  collapsed: boolean
}

function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const Icon = item.icon

  const baseCn = cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full',
    collapsed && 'justify-center px-2'
  )

  const activeCn = 'bg-sidebar-primary text-sidebar-primary-foreground'
  const inactiveCn = 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
  const disabledCn = 'text-sidebar-foreground/40 cursor-not-allowed'

  if (item.comingSoon) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className={cn(baseCn, disabledCn)}>
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 ml-auto shrink-0">
                  Soon
                </Badge>
              </>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          {collapsed ? item.label : 'Coming in a future phase'}
        </TooltipContent>
      </Tooltip>
    )
  }

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <NavLink
            to={item.path}
            className={({ isActive }) => cn(baseCn, isActive ? activeCn : inactiveCn)}
          >
            <Icon className="h-4 w-4 shrink-0" />
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => cn(baseCn, isActive ? activeCn : inactiveCn)}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-auto shrink-0">
          {item.badge}
        </Badge>
      )}
    </NavLink>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useSettingsStore()
  const { user } = useAuthStore()

  const role: UserRole = user?.primaryRole ?? 'student'
  const groups = NAV_REGISTRY[role] ?? NAV_REGISTRY.student

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'relative flex flex-col border-r bg-sidebar transition-all duration-300 ease-in-out shrink-0',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-sidebar-border px-4 shrink-0',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
              <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="text-sm font-semibold text-sidebar-foreground">Dezolver</p>
                {user?.tenantName && (
                  <p className="text-xs text-sidebar-foreground/60 truncate max-w-[140px]">
                    {user.tenantName}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className={cn('space-y-4', sidebarCollapsed ? 'px-2' : 'px-3')}>
            {groups.map((group, gi) => (
              <div key={gi} className="space-y-1">
                {group.label && !sidebarCollapsed && (
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                    {group.label}
                  </p>
                )}
                {group.items.map((item) => (
                  <SidebarNavItem key={item.path} item={item} collapsed={sidebarCollapsed} />
                ))}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User section */}
        <Separator className="bg-sidebar-border" />
        <div className={cn('p-3', sidebarCollapsed && 'flex justify-center')}>
          {sidebarCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="flex h-8 w-8 cursor-default items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium">
                  {user ? formatInitials(user.fullName) : 'U'}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {user?.fullName ?? 'User'}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium">
                {user ? formatInitials(user.fullName) : 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user?.fullName ?? 'Loading...'}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {user ? ROLE_LABELS[user.primaryRole] : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background text-muted-foreground shadow-sm hover:bg-accent"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>
    </TooltipProvider>
  )
}

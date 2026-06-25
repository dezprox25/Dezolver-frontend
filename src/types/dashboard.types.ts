import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

// ─── KPI / Stats ──────────────────────────────────────────────────────────────

export interface StatValue {
  label: string
  value: number | string
  /** e.g. "+12%" or "↑ 3" */
  change?: string
  /** positive = green, negative = red, neutral = grey */
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: LucideIcon
  href?: string
}

export interface DashboardStats {
  kpis: StatValue[]
  updatedAt: string
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export type ActivityType =
  | 'submission'
  | 'enrollment'
  | 'completion'
  | 'event'
  | 'certificate'
  | 'system'
  | 'login'
  | 'invite'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description?: string
  timestamp: string
  actor?: string
  href?: string
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: LucideIcon
  href?: string
  onClick?: () => void
  /** Permission required to show this action */
  permission?: string
  /** True → shows "Coming soon" overlay instead of navigating */
  comingSoon?: boolean
  /** Feature gate key */
  feature?: string
}

// ─── Widget Configuration ─────────────────────────────────────────────────────

export type WidgetSpan = 1 | 2 | 3 | 4

export interface WidgetConfig {
  id: string
  title: string
  span?: WidgetSpan
  permission?: string
  feature?: string
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────

export interface DashboardSection {
  id: string
  widgets: WidgetConfig[]
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error'

export interface AppNotification {
  id: string
  title: string
  message: string
  severity: NotificationSeverity
  read: boolean
  createdAt: string
  link?: string
  /** Module that generated this notification */
  source?: string
}

// ─── Component utility ───────────────────────────────────────────────────────

export interface EmptyStateConfig {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export type { ReactNode }

import type { UserRole } from '@/types/auth.types'

// ─── Tenant ───────────────────────────────────────────────────────────────────

export type TenantStatus =
  | 'pending'
  | 'trial'
  | 'active'
  | 'suspended'
  | 'expired'
  | 'cancelled'
  | 'purged'

export type TenantKind = 'college' | 'direct'

export type PlanCode = 'starter' | 'professional' | 'enterprise' | 'unlimited'

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'

export interface TenantBranding {
  logoUrl?: string | null
  primaryColor?: string
  faviconUrl?: string | null
}

export interface TenantConfig {
  branding?: TenantBranding
  pathsLockCurated?: boolean
  ssoEnabled?: boolean
  [key: string]: unknown
}

export interface TenantSubscription {
  id: string
  planCode: PlanCode
  status: SubscriptionStatus
  trialEndsAt?: string | null
  currentPeriodEnd?: string | null
}

export interface Tenant {
  id: string
  kind: TenantKind
  name: string
  subdomain: string
  status: TenantStatus
  config?: TenantConfig
  subscription?: TenantSubscription
  primaryContactEmail?: string
  primaryDomain?: string
  expectedStudentCount?: number
  createdAt: string
  statusChangedAt?: string | null
}

// ─── Cohort ───────────────────────────────────────────────────────────────────

export interface Cohort {
  id: string
  tenantId: string
  name: string
  academicYear?: string | null
  memberCount?: number
  createdAt: string
}

// ─── Invitation ───────────────────────────────────────────────────────────────

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired'

export interface Invitation {
  id: string
  tenantId: string
  email: string
  role: UserRole
  cohortId?: string | null
  cohortName?: string | null
  status: InvitationStatus
  expiresAt: string
  createdAt: string
  acceptedAt?: string | null
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateTenantDto {
  kind: TenantKind
  name: string
  subdomain: string
  primaryContactEmail: string
  primaryDomain: string
  expectedStudentCount?: number
  planCode: PlanCode
}

export interface UpdateTenantDto {
  name?: string
  subdomain?: string
  primaryContactEmail?: string
}

export interface TransitionTenantDto {
  to: Exclude<TenantStatus, 'purged'>
  reason?: string
  actorJustification?: string
}

export interface CreateCohortDto {
  name: string
  academicYear?: string
}

export interface CreateInvitationDto {
  email: string
  role: Extract<UserRole, 'student' | 'faculty' | 'coordinator' | 'college_admin'>
  cohortId?: string | null
}

// ─── Lifecycle state machine ──────────────────────────────────────────────────

export const VALID_TRANSITIONS: Partial<Record<TenantStatus, TenantStatus[]>> = {
  pending: ['trial', 'cancelled'],
  trial: ['active', 'suspended', 'cancelled'],
  active: ['suspended', 'cancelled'],
  suspended: ['active', 'cancelled'],
  expired: ['active', 'cancelled'],
  cancelled: ['purged'],
  purged: [],
}

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  pending: 'Pending',
  trial: 'Trial',
  active: 'Active',
  suspended: 'Suspended',
  expired: 'Expired',
  cancelled: 'Cancelled',
  purged: 'Purged',
}

export const PLAN_LABELS: Record<PlanCode, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
  unlimited: 'Unlimited',
}

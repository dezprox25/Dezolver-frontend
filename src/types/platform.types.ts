// ─── Audit ────────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string
  action: string
  actorId: string
  actorEmail?: string | null
  actorRole?: string | null
  targetId?: string | null
  targetType?: string | null
  tenantId?: string | null
  metadata?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
}

export interface ListAuditParams {
  action?: string
  actorId?: string
  tenantId?: string
  targetType?: string
  from?: string
  to?: string
  limit?: number
  cursor?: string
}

// ─── Feature Flags ────────────────────────────────────────────────────────────

export interface FeatureFlag {
  key: string
  name: string
  description?: string | null
  enabled: boolean
  scope: 'global' | 'tenant'
  tenantId?: string | null
  updatedAt?: string | null
}

export type FeatureFlagMap = Record<string, boolean>

export interface UpdateFeatureFlagsDto {
  flags: FeatureFlagMap
}

// ─── System Health ────────────────────────────────────────────────────────────

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export interface HealthCheck {
  status: HealthStatus
  latencyMs?: number
  message?: string
}

export interface HealthResponse {
  status: HealthStatus
  container: string
  version: string
  gitSha: string
  checks?: Record<string, HealthCheck>
}

export interface VersionResponse {
  version: string
  gitSha?: string | null
  builtAt?: string | null
  environment?: string | null
}

export interface TimeResponse {
  serverTime: string
  timezone?: string | null
}

// ─── Launch ───────────────────────────────────────────────────────────────────

export type LaunchPhase = 'pre_launch' | 'beta' | 'limited_ga' | 'full_ga'

export interface LaunchStatus {
  currentPhase: LaunchPhase
  advancedAt?: string | null
  advancedBy?: string | null
  nextPhase?: LaunchPhase | null
  notes?: string | null
}

export const LAUNCH_PHASE_LABELS: Record<LaunchPhase, string> = {
  pre_launch: 'Pre-Launch',
  beta: 'Beta',
  limited_ga: 'Limited GA',
  full_ga: 'Full GA',
}

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  unhealthy: 'Unhealthy',
}

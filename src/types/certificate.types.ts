// ─── Certificate ──────────────────────────────────────────────────────────────

export type CertificateStatus = 'pending' | 'issued' | 'revoked' | 'generation_failed'

export type AchievementKind = 'path' | 'event' | 'room' | 'manual'

export interface Certificate {
  /** Database primary key (UUID) */
  id: string
  /** Human-friendly ID: DZL-YYYY-XXXXXXXX (Crockford base32) */
  certificateId: string
  recipientUserId: string
  recipientName?: string
  status: CertificateStatus
  isPublic: boolean
  achievementKind: AchievementKind
  achievementId?: string
  achievementTitle?: string
  templateId?: string
  templateName?: string
  issuedAt?: string | null
  revokedAt?: string | null
  revokedReason?: string | null
  tenantId?: string | null
  createdAt: string
}

// ─── Verification (public, no auth) ──────────────────────────────────────────

export type VerificationStatus = 'valid' | 'revoked' | 'private' | 'not_found' | 'expired'

export interface VerificationResult {
  certificateId: string
  status: VerificationStatus
  // Present when valid
  recipientName?: string
  achievementTitle?: string
  issuedOn?: string
  issuingEntity?: string
  downloadAvailable?: boolean
  // Present when revoked
  revokedOn?: string
  reason?: string
}

// ─── Certificate Template ─────────────────────────────────────────────────────

export type TemplateStatus = 'draft' | 'published' | 'archived'
export type PageOrientation = 'landscape' | 'portrait'
export type PageSize = 'A4' | 'Letter'

export interface CertificateTemplate {
  id: string
  name: string
  description?: string | null
  bodyHtml: string
  bodyCss: string
  status: TemplateStatus
  pageOrientation: PageOrientation
  pageSize: PageSize
  defaultVariables?: Record<string, string> | null
  tenantId?: string | null
  createdAt: string
  updatedAt?: string | null
}

// ─── Issuance Rule ────────────────────────────────────────────────────────────

export type TriggerEventType =
  | 'PathCompleted'
  | 'EventCompleted'
  | 'RoomCompleted'
  | 'ManualIssue'

export interface IssuanceRule {
  id: string
  name?: string
  triggerEventType: TriggerEventType
  templateId: string
  templateName?: string
  conditions?: Record<string, unknown>
  isActive: boolean
  tenantId?: string | null
  createdAt: string
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface UpdateCertificateDto {
  isPublic: boolean
}

export interface RevokeCertificateDto {
  reason: string
}

export interface CreateTemplateDto {
  name: string
  description?: string
  bodyHtml: string
  bodyCss: string
  pageOrientation?: PageOrientation
  pageSize?: PageSize
  defaultVariables?: Record<string, string>
}

export interface UpdateTemplateDto {
  name?: string
  description?: string
  bodyHtml?: string
  bodyCss?: string
  pageOrientation?: PageOrientation
  pageSize?: PageSize
  defaultVariables?: Record<string, string>
}

export interface PreviewTemplateDto {
  variables: Record<string, string>
}

export interface CreateIssuanceRuleDto {
  name?: string
  triggerEventType: TriggerEventType
  templateId: string
  conditions?: Record<string, unknown>
}

export interface ManualIssueCertificateDto {
  userId: string
  templateId: string
  achievementTitle: string
  variables?: Record<string, string>
}

// ─── Labels & Constants ───────────────────────────────────────────────────────

export const CERTIFICATE_STATUS_LABELS: Record<CertificateStatus, string> = {
  pending: 'Generating',
  issued: 'Issued',
  revoked: 'Revoked',
  generation_failed: 'Failed',
}

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  valid: 'Valid',
  revoked: 'Revoked',
  private: 'Private',
  not_found: 'Not Found',
  expired: 'Expired',
}

export const TEMPLATE_STATUS_LABELS: Record<TemplateStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export const TRIGGER_LABELS: Record<TriggerEventType, string> = {
  PathCompleted: 'Learning Path Completed',
  EventCompleted: 'Event / Competition Completed',
  RoomCompleted: 'Room Completed',
  ManualIssue: 'Manual Issue',
}

/**
 * Variables supported in certificate templates (Mustache-style).
 * Backend resolver populates these from the certificate + recipient + template data.
 */
export const TEMPLATE_VARIABLES = [
  { name: 'recipientName', description: "Recipient's full name" },
  { name: 'issuerName', description: 'Issuing entity (tenant or platform)' },
  { name: 'achievementTitle', description: 'Title of the achievement' },
  { name: 'issuedAt', description: 'Issue date (localized)' },
  { name: 'certificateId', description: 'Human-friendly certificate ID (DZL-...)' },
  { name: 'verificationUrl', description: 'Full verification URL' },
  { name: 'verificationQrDataUrl', description: 'QR code data URL (embed as <img src>)' },
  { name: 'eventName', description: 'Event title (for EventCompleted trigger)' },
  { name: 'eventDate', description: 'Event date (for EventCompleted trigger)' },
  { name: 'pathName', description: 'Path title (for PathCompleted trigger)' },
  { name: 'assessmentName', description: 'Assessment title' },
  { name: 'signatoryName', description: "Signatory's name (from template defaults)" },
  { name: 'signatoryTitle', description: "Signatory's title (from template defaults)" },
] as const

export type TemplateVariableName = (typeof TEMPLATE_VARIABLES)[number]['name']

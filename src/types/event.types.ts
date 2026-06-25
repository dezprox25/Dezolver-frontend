// ─── Event ────────────────────────────────────────────────────────────────────

export type EventKind = 'workshop' | 'competition'

export type EventStatus =
  | 'draft'
  | 'published'
  | 'registration_open'
  | 'registration_closed'
  | 'live'
  | 'grading'
  | 'completed'
  | 'cancelled'

export type AudienceScope =
  | 'cohort'
  | 'tenant'
  | 'tenant_open'
  | 'multi_tenant'
  | 'platform'

export interface AudienceFilter {
  cohortIds?: string[]
  tenantIds?: string[]
  priceInr?: number
}

export interface CompetitionProblem {
  problemId: string
  points: number
  order: number
  title?: string
  difficulty?: string
  slug?: string
}

export type ScoringType = 'icpc' | 'weighted' | 'simple'

export interface CompetitionScoring {
  type: ScoringType
  wrongAttemptPenaltyMinutes?: number
}

// ─── Workshop-specific types ──────────────────────────────────────────────────

export interface Speaker {
  name: string
  title?: string | null
  bio?: string | null
  avatarUrl?: string | null
}

export interface AgendaItem {
  time: string
  title: string
  description?: string | null
  speakerName?: string | null
}

export interface EventMaterial {
  title: string
  url: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface EventConfig {
  // Competition fields
  problems?: CompetitionProblem[]
  scoring?: CompetitionScoring
  leaderboardVisibleDuringEvent?: boolean
  allowedLanguages?: string[]
  // Workshop fields (stored as JSONB in backend)
  speakers?: Speaker[]
  agenda?: AgendaItem[]
  materials?: EventMaterial[]
}

export interface Event {
  id: string
  kind: EventKind
  title: string
  description?: string | null
  audienceScope: AudienceScope
  audienceFilter?: AudienceFilter | null
  status: EventStatus
  registrationOpensAt?: string | null
  registrationClosesAt?: string | null
  startsAt: string
  endsAt: string
  capacity?: number | null
  registrationCount?: number
  config?: EventConfig | null
  tenantId?: string | null
  createdByUserId?: string
  createdAt: string
  updatedAt?: string | null
  // Caller-specific context (from GET /events/:id)
  myRegistration?: Registration | null
}

// ─── Registration ─────────────────────────────────────────────────────────────

export type RegistrationStatus =
  | 'registered'
  | 'waitlisted'
  | 'pending_payment'
  | 'cancelled'
  | 'refunded'

export type RegistrationSource = 'tenant' | 'external_paid'

export interface Registration {
  id: string
  eventId: string
  userId?: string
  status: RegistrationStatus
  source?: RegistrationSource
  registeredAt?: string | null
  createdAt: string
  // Payment fields (when status = pending_payment)
  payment?: RegistrationPayment | null
}

export interface RegistrationPayment {
  razorpayOrderId: string
  amount: number
  currency: string
  publicKey: string
}

export interface RegistrationCreateResponse {
  registrationId: string
  status: RegistrationStatus
  payment?: RegistrationPayment | null
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName?: string
  acceptedCount: number
  totalTime: number
  wrongAttempts?: Record<string, number>
  score?: number
  isCurrentUser?: boolean
}

export interface EventLeaderboard {
  eventId: string
  entries: LeaderboardEntry[]
  updatedAt?: string
}

export interface MyStanding {
  rank: number
  acceptedCount: number
  totalTime: number
  score?: number
}

// ─── Event Result ─────────────────────────────────────────────────────────────

export interface EventResult {
  userId: string
  displayName?: string
  rank: number
  score: number
  totalTimeSeconds?: number
  acceptedProblems?: string[]
}

// ─── Global Platform Rating ───────────────────────────────────────────────────

export interface GlobalRatingEntry {
  rank: number
  personId: string
  displayName?: string
  rating: number
  eventsParticipated?: number
}

export interface GlobalLeaderboard {
  entries: GlobalRatingEntry[]
  total: number
  updatedAt?: string
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateEventDto {
  kind: EventKind
  title: string
  description?: string
  audienceScope: AudienceScope
  audienceFilter?: AudienceFilter
  registrationOpensAt?: string
  registrationClosesAt?: string
  startsAt: string
  endsAt: string
  capacity?: number
  config?: EventConfig
}

export interface UpdateEventDto {
  title?: string
  description?: string
  registrationOpensAt?: string
  registrationClosesAt?: string
  startsAt?: string
  endsAt?: string
  capacity?: number
  config?: EventConfig
}

export interface ExtendEventDto {
  newEndsAt: string
  reason: string
}

export interface CompetitionSubmitDto {
  problemId: string
  language: string
  code: string
}

// ─── Labels & Constants ───────────────────────────────────────────────────────

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  registration_open: 'Registration Open',
  registration_closed: 'Registration Closed',
  live: 'Live',
  grading: 'Grading',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  workshop: 'Workshop',
  competition: 'Competition',
}

export const AUDIENCE_SCOPE_LABELS: Record<AudienceScope, string> = {
  cohort: 'Cohort',
  tenant: 'Institution',
  tenant_open: 'Open (Paid for External)',
  multi_tenant: 'Multi-Institution',
  platform: 'Platform-Wide',
}

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  registered: 'Registered',
  waitlisted: 'Waitlisted',
  pending_payment: 'Pending Payment',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export function isEventActive(status: EventStatus): boolean {
  return status === 'live'
}

export function isEventUpcoming(status: EventStatus): boolean {
  return ['published', 'registration_open', 'registration_closed'].includes(status)
}

export function isEventPast(status: EventStatus): boolean {
  return ['grading', 'completed', 'cancelled'].includes(status)
}

export function canRegister(event: Event): boolean {
  return (
    event.status === 'registration_open' &&
    (event.capacity == null || (event.registrationCount ?? 0) < event.capacity)
  )
}

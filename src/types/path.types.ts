// ─── Path ─────────────────────────────────────────────────────────────────────

export type PathKind = 'default' | 'curated' | 'personalized'
export type PathStatus = 'draft' | 'published' | 'archived'
export type RoomProgressState = 'not_started' | 'in_progress' | 'completed' | 'skipped'

export interface PathStep {
  id: string
  pathId: string
  roomId: string
  orderIndex: number
  isOptional: boolean
  prerequisiteStepIds: string[]
  /** Populated when joining with room data */
  room?: PathStepRoom | null
  /** Populated for authenticated users */
  progress?: RoomProgressState | null
  unlocked?: boolean
  prerequisitesMet?: boolean
}

export interface PathStepRoom {
  id: string
  slug: string
  title: string
  difficulty: string
  estimatedMinutes?: number | null
  domainCodes?: string[]
}

export interface Path {
  id: string
  kind: PathKind
  status: PathStatus
  title: string
  description?: string | null
  outcomeStatement?: string | null
  domainCode?: string | null
  estimatedMinutes?: number | null
  stepCount?: number
  steps?: PathStep[]
  ownerUserId?: string | null
  sourcePathId?: string | null
  tenantId?: string | null
  createdAt: string
  updatedAt?: string | null
  /** Populated for the requesting user */
  myProgress?: PathProgress | null
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface PathProgress {
  pathId: string
  userId: string
  percentageComplete: number
  stepsCompleted: number
  stepsTotal: number
  lastActivityAt?: string | null
  completedAt?: string | null
  isCompleted: boolean
}

export interface RoomProgress {
  roomId: string
  userId: string
  state: RoomProgressState
  startedAt?: string | null
  completedAt?: string | null
  timeSpentMinutes?: number | null
}

// ─── Next Step ────────────────────────────────────────────────────────────────

export interface NextStepResult {
  pathId: string
  completion: {
    percentage: number
    stepsCompleted: number
    stepsTotal: number
  }
  next: PathStep | null
  upcoming: PathStep[]
}

// ─── Career Map ───────────────────────────────────────────────────────────────

export interface CareerMapPath {
  id: string
  title: string
  kind: PathKind
  estimatedMinutes?: number | null
  stepCount?: number
}

export interface CareerMap {
  id: string
  title: string
  description?: string | null
  domainCode: string
  outcomeStatement?: string | null
  paths: CareerMapPath[]
  createdAt: string
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreatePathDto {
  kind: PathKind
  title: string
  description?: string
  outcomeStatement?: string
  domainCode?: string
  estimatedMinutes?: number
}

export interface UpdatePathDto {
  title?: string
  description?: string
  outcomeStatement?: string
  estimatedMinutes?: number
}

export interface AddPathStepDto {
  roomId: string
  orderIndex?: number
  isOptional?: boolean
  prerequisiteStepIds?: string[]
}

export interface UpdatePathStepDto {
  orderIndex?: number
  isOptional?: boolean
  prerequisiteStepIds?: string[]
}

export interface ReorderStepsDto {
  orderedStepIds: string[]
}

// ─── Labels & Constants ───────────────────────────────────────────────────────

export const PATH_KIND_LABELS: Record<PathKind, string> = {
  default: 'Platform',
  curated: 'Curated',
  personalized: 'My Path',
}

export const PATH_STATUS_LABELS: Record<PathStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export const ROOM_PROGRESS_LABELS: Record<RoomProgressState, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  skipped: 'Skipped',
}

export const DOMAIN_LABELS: Record<string, string> = {
  cse: 'Computer Science',
  ece: 'Electronics',
  mech: 'Mechanical',
  aiml: 'AI / ML',
  eee: 'Electrical',
  civil: 'Civil',
  it: 'Information Technology',
}

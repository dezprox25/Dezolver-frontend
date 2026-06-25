// ─── Content Lifecycle ───────────────────────────────────────────────────────

export type ContentStatus = 'draft' | 'review' | 'published' | 'archived'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

// ─── Block Types (Room body) ──────────────────────────────────────────────────

export type BlockType =
  | 'text'
  | 'heading'
  | 'code'
  | 'media'
  | 'callout'
  | 'embedded_problem'
  | 'embedded_quiz'
  | 'task'
  | 'divider'

export interface TextBlock {
  type: 'text'
  content: string
}

export interface HeadingBlock {
  type: 'heading'
  level: 1 | 2 | 3
  content: string
}

export interface CodeBlock {
  type: 'code'
  language: string
  content: string
  filename?: string
}

export interface MediaBlock {
  type: 'media'
  assetId: string
  caption?: string
  alt?: string
}

export type CalloutTone = 'info' | 'warning' | 'success' | 'error' | 'tip'

export interface CalloutBlock {
  type: 'callout'
  tone: CalloutTone
  content: string
}

export interface EmbeddedProblemBlock {
  type: 'embedded_problem'
  problemId: string
  passingScore?: number
}

export interface EmbeddedQuizBlock {
  type: 'embedded_quiz'
  questions: Array<{
    id: string
    text: string
    options: Array<{ id: string; text: string }>
    correctOptionId: string
  }>
}

export interface TaskBlock {
  type: 'task'
  description: string
  required: boolean
}

export interface DividerBlock {
  type: 'divider'
}

export type ContentBlock =
  | TextBlock
  | HeadingBlock
  | CodeBlock
  | MediaBlock
  | CalloutBlock
  | EmbeddedProblemBlock
  | EmbeddedQuizBlock
  | TaskBlock
  | DividerBlock

// ─── Room Version ─────────────────────────────────────────────────────────────

export interface RoomVersion {
  id: string
  versionNumber: number
  status: 'pending_approval' | 'published' | 'archived'
  publishedAt?: string | null
  createdAt: string
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export interface Room {
  id: string
  slug: string
  title: string
  summary?: string | null
  difficulty: Difficulty
  estimatedMinutes?: number | null
  domainCodes: string[]
  skillTags: string[]
  status: ContentStatus
  currentVersion?: RoomVersion | null
  body?: ContentBlock[]
  authorId?: string | null
  authorName?: string | null
  publishedAt?: string | null
  createdAt: string
  updatedAt?: string | null
}

// ─── Course ───────────────────────────────────────────────────────────────────

export interface CourseRoom {
  id: string
  slug: string
  title: string
  difficulty: Difficulty
  estimatedMinutes?: number | null
  position: number
}

export interface Course {
  id: string
  slug: string
  title: string
  summary?: string | null
  difficulty: Difficulty
  domainCodes: string[]
  skillTags: string[]
  status: ContentStatus
  rooms: CourseRoom[]
  roomCount?: number
  estimatedMinutes?: number | null
  createdAt: string
  updatedAt?: string | null
}

// ─── Problem ─────────────────────────────────────────────────────────────────

export type ProblemDifficulty = 'easy' | 'medium' | 'hard'

export interface ProblemTestCase {
  id: string
  index: number
  isSample: boolean
  input?: string | null
  expectedOutput?: string | null
  weight: number
  explanation?: string | null
}

export interface Problem {
  id: string
  slug: string
  title: string
  difficulty: ProblemDifficulty
  topics: string[]
  companies: string[]
  status: ContentStatus
  statementMd: string
  inputFormat?: string | null
  outputFormat?: string | null
  constraints?: string | null
  allowedLanguages: string[]
  timeLimitMs: number
  memoryLimitMb: number
  testCases?: ProblemTestCase[]
  createdAt: string
  updatedAt?: string | null
}

// ─── Media Asset ──────────────────────────────────────────────────────────────

export type MediaKind = 'image' | 'video' | 'document' | 'audio'
export type MediaStatus = 'pending' | 'processing' | 'ready' | 'failed'

export interface MediaAsset {
  id: string
  kind: MediaKind
  filename: string
  mimeType: string
  sizeBytes?: number | null
  status: MediaStatus
  cdnUrl?: string | null
  width?: number | null
  height?: number | null
  durationSeconds?: number | null
  uploadedByUserId?: string | null
  createdAt: string
}

export interface UploadInitiateResponse {
  assetId: string
  uploadUrl: string
  method: 'PUT'
  headers?: Record<string, string>
  expiresAt: string
}

// ─── Search ───────────────────────────────────────────────────────────────────

export type SearchKind = 'room' | 'course' | 'problem' | 'all'

export interface SearchFilters {
  domain?: string
  difficulty?: string
  tags?: string[]
}

export interface SearchRequest {
  q: string
  kind?: SearchKind
  filters?: SearchFilters
}

export interface SearchResultItem {
  kind: 'room' | 'course' | 'problem'
  id: string
  slug: string
  title: string
  summary?: string | null
  difficulty?: string | null
  domainCodes?: string[]
  skillTags?: string[]
  status: ContentStatus
  score?: number
}

export interface SearchResponse {
  items: SearchResultItem[]
  total: number
  query: string
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateRoomDto {
  title: string
  summary?: string
  difficulty: Difficulty
  estimatedMinutes?: number
  domainCodes?: string[]
  skillTags?: string[]
  body?: ContentBlock[]
}

export interface UpdateRoomDto {
  title?: string
  summary?: string
  difficulty?: Difficulty
  estimatedMinutes?: number
  domainCodes?: string[]
  skillTags?: string[]
  body?: ContentBlock[]
}

export interface CreateCourseDto {
  title: string
  summary?: string
  difficulty: Difficulty
  domainCodes?: string[]
  skillTags?: string[]
}

export interface CreateProblemDto {
  title: string
  difficulty: ProblemDifficulty
  topics?: string[]
  companies?: string[]
  statementMd: string
  inputFormat?: string
  outputFormat?: string
  constraints?: string
  allowedLanguages?: string[]
  timeLimitMs?: number
  memoryLimitMb?: number
}

export interface AddTestCaseDto {
  input: string
  expectedOutput: string
  isSample: boolean
  weight?: number
  explanation?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

export const PROBLEM_DIFFICULTY_LABELS: Record<ProblemDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Draft',
  review: 'In Review',
  published: 'Published',
  archived: 'Archived',
}

export const DOMAIN_CODE_LABELS: Record<string, string> = {
  cse: 'Computer Science',
  ece: 'Electronics',
  mech: 'Mechanical',
  aiml: 'AI / ML',
  eee: 'Electrical',
  civil: 'Civil',
  it: 'Information Technology',
}

export const ALLOWED_LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust', 'kotlin',
] as const

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  text: 'Text',
  heading: 'Heading',
  code: 'Code Snippet',
  media: 'Media',
  callout: 'Callout',
  embedded_problem: 'Embedded Problem',
  embedded_quiz: 'Quiz',
  task: 'Task',
  divider: 'Divider',
}

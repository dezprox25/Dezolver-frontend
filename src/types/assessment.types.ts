import type { Problem } from '@/types/content.types'

// ─── Assessment ───────────────────────────────────────────────────────────────

export type AssessmentKind = 'coding_problem' | 'quiz' | 'mcq' | 'mcq_single' | 'mcq_multi' | 'short_answer'
export type AssessmentContextKind = 'room' | 'event' | 'practice'
export type AssessmentStatus = 'draft' | 'published' | 'archived'

export interface AssessmentScoringConfig {
  type: 'pass_fail' | 'percentage' | 'icpc'
  passingScore?: number
  wrongAttemptPenaltyMinutes?: number
}

export interface AssessmentConfig {
  allowedLanguages?: string[]
  maxAttempts?: number | null
  timeLimitMinutes?: number | null
  passingScore?: number | null
  partialCredit?: boolean
  shortAnswerTolerance?: number
  scoring?: AssessmentScoringConfig
}

export interface AssessmentQuestion {
  id: string
  kind: 'mcq_single' | 'mcq_multi' | 'short_answer'
  text: string
  options?: Array<{ id: string; text: string }>
  correctOptionId?: string
  correctOptionIds?: string[]
  weight?: number
}

export interface Assessment {
  id: string
  title: string
  description?: string | null
  kind: AssessmentKind
  problemId?: string | null
  roomId?: string | null
  maxAttempts?: number | null
  timeLimitMinutes?: number | null
  collectAntiCheat?: boolean
  createdByUserId?: string
  status?: AssessmentStatus
  // Backward compatibility
  config?: AssessmentConfig
  contextKind?: AssessmentContextKind
  // Coding-specific
  problem?: Problem | null
  // Quiz-specific
  questions?: AssessmentQuestion[]
  // Metadata
  createdAt: string
  updatedAt?: string | null
  // Student-facing (populated on detail endpoint)
  myAttemptCount?: number
  myBestVerdict?: string | null
}

// ─── Submission ───────────────────────────────────────────────────────────────

export type SubmissionVerdict =
  | 'pending'
  | 'queued'
  | 'executing'
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'runtime_error'
  | 'compilation_error'
  | 'partial'
  | 'system_error'

export type SubmissionStatus = 'pending' | 'queued' | 'executing' | 'completed' | 'failed'

export interface TestCaseResult {
  index: number
  isSample: boolean
  status: string
  timeMs?: number | null
  memoryKb?: number | null
  expectedOutput?: string | null
  actualOutput?: string | null
}

export interface ClientMetadata {
  timeOnTaskMs?: number
  pasteEventCount?: number
  tabBlurCount?: number
  windowBlurCount?: number
}

export interface Submission {
  id: string
  assessmentId: string
  userId: string
  kind: AssessmentKind
  verdict: SubmissionVerdict
  status?: SubmissionStatus
  score?: number | null
  testCasesPassed?: number | null
  testCasesTotal?: number | null
  executionTimeMs?: number | null
  memoryUsedKb?: number | null
  language?: string | null
  attemptNumber?: number
  submittedAt: string
  gradedAt?: string | null
  // Faculty/admin visible
  sourceCode?: string | null
  testCaseResults?: TestCaseResult[]
  clientMetadata?: ClientMetadata | null
  isFlagged?: boolean
  // Embedded for display
  assessmentTitle?: string
  problemTitle?: string
  tenantId?: string
}

/** Shape returned immediately after a 202 submission */
export interface SubmissionCreateResponse {
  submissionId: string
  kind: AssessmentKind
  status: 'pending'
  attemptNumber: number
  subscribeChannel: string
  pollUrl: string
}

// ─── Judge Run ────────────────────────────────────────────────────────────────

export interface JudgeRun {
  id: string
  submissionId: string
  attemptNumber: number
  startedAt?: string | null
  completedAt?: string | null
  testCaseResults?: TestCaseResult[]
  rawResponse?: unknown
}

// ─── Flagged Submission ───────────────────────────────────────────────────────

export type FlaggedDecision = 'cleared' | 'flagged' | 'invalidated'

export interface FlaggedSubmission {
  id: string
  submissionId: string
  userId: string
  assessmentId: string
  assessmentTitle?: string
  suspicionScore?: number
  signals?: ClientMetadata
  decision?: FlaggedDecision | null
  reviewNote?: string | null
  reviewedAt?: string | null
  reviewedByUserId?: string | null
  createdAt: string
  submission?: Submission
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateAssessmentDto {
  title: string
  description?: string
  kind: AssessmentKind
  problemId?: string | null
  roomId?: string | null
  maxAttempts?: number | null
  timeLimitMinutes?: number | null
  collectAntiCheat?: boolean
  questions?: AssessmentQuestion[]
}

export interface UpdateAssessmentDto {
  title?: string
  description?: string
  problemId?: string | null
  roomId?: string | null
  maxAttempts?: number | null
  timeLimitMinutes?: number | null
  collectAntiCheat?: boolean
  questions?: AssessmentQuestion[]
  status?: AssessmentStatus
}

// ─── MCQ submission types ─────────────────────────────────────────────────────

export interface MCQAnswer {
  questionId: string
  value?: string
  values?: string[]
}

export interface MCQSubmitDto {
  answers: MCQAnswer[]
  clientMetadata?: ClientMetadata
}

export interface MCQPerQuestion {
  questionId: string
  correct: boolean
  points: number
  maxPoints: number
}

export interface MCQSubmissionResult {
  id: string
  verdict: SubmissionVerdict
  score: number
  perQuestion?: MCQPerQuestion[]
  submittedAt?: string
}

export interface SubmitCodeDto {
  language: string
  code: string
  clientMetadata?: ClientMetadata
}

export interface ReviewFlaggedDto {
  decision: FlaggedDecision
  note?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const VERDICT_LABELS: Record<SubmissionVerdict, string> = {
  pending: 'Pending',
  queued: 'In Queue',
  executing: 'Executing',
  accepted: 'Accepted',
  wrong_answer: 'Wrong Answer',
  time_limit_exceeded: 'Time Limit',
  memory_limit_exceeded: 'Memory Limit',
  runtime_error: 'Runtime Error',
  compilation_error: 'Compilation Error',
  partial: 'Partial Credit',
  system_error: 'System Error',
}

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export const ASSESSMENT_KIND_LABELS: Record<AssessmentKind, string> = {
  coding_problem: 'Coding',
  mcq_single: 'MCQ (Single)',
  mcq_multi: 'MCQ (Multi)',
  short_answer: 'Short Answer',
  quiz: 'Quiz',
  mcq: 'MCQ',
}

export const SUPPORTED_LANGUAGES: Array<{ value: string; label: string; monacoLang: string }> = [
  { value: 'python', label: 'Python 3', monacoLang: 'python' },
  { value: 'java', label: 'Java', monacoLang: 'java' },
  { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { value: 'c', label: 'C', monacoLang: 'c' },
  { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
  { value: 'typescript', label: 'TypeScript', monacoLang: 'typescript' },
  { value: 'go', label: 'Go', monacoLang: 'go' },
  { value: 'rust', label: 'Rust', monacoLang: 'rust' },
  { value: 'kotlin', label: 'Kotlin', monacoLang: 'kotlin' },
]

export const LANGUAGE_TEMPLATES: Record<string, string> = {
  python: `def solve():\n    pass\n\nsolve()\n`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n    }\n}\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    return 0;\n}\n`,
  c: `#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n`,
  javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\n\nfunction solve() {\n    \n}\n\nsolve();\n`,
  typescript: `import * as readline from 'readline';\n\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines: string[] = [];\nrl.on('line', (line) => lines.push(line));\nrl.on('close', () => {\n    // solve here\n});\n`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    \n    fmt.Println()\n}\n`,
  rust: `use std::io::{self, BufRead};\n\nfn main() {\n    let stdin = io::stdin();\n    for line in stdin.lock().lines() {\n        let _line = line.unwrap();\n    }\n}\n`,
  kotlin: 'fun main() {\n    val br = System.`in`.bufferedReader()\n    \n}\n',
}

// Is the verdict terminal (grading complete)?
export function isTerminalVerdict(verdict: SubmissionVerdict): boolean {
  return !['pending', 'queued', 'executing'].includes(verdict)
}

export function isAccepted(verdict: SubmissionVerdict): boolean {
  return verdict === 'accepted'
}

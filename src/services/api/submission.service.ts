import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type {
  Submission,
  SubmissionCreateResponse,
  SubmitCodeDto,
  MCQSubmitDto,
  MCQSubmissionResult,
  JudgeRun,
  FlaggedSubmission,
  ReviewFlaggedDto,
  SubmissionVerdict,
} from '@/types/assessment.types'

export interface ListSubmissionsParams {
  assessment?: string
  assessmentId?: string
  verdict?: SubmissionVerdict
  language?: string
  from?: string
  to?: string
  limit?: number
  cursor?: string
}

export interface PaginatedSubmissions {
  items: Submission[]
  pagination: PaginationMeta
}

export const submissionService = {
  /**
   * POST /assessments/:id/submissions — coding (async, 202) or MCQ (sync, 200).
   * Coding: returns SubmissionCreateResponse (submissionId + pollUrl).
   * MCQ/quiz: returns MCQSubmissionResult with verdict immediately.
   */
  async submit(
    assessmentId: string,
    dto: SubmitCodeDto
  ): Promise<SubmissionCreateResponse> {
    const res = await apiClient.post<ApiSuccess<SubmissionCreateResponse>>(
      `/assessments/${encodeURIComponent(assessmentId)}/submissions`,
      dto
    )
    return res.data.data
  },

  /** POST /assessments/:id/submissions — MCQ variant (200 OK, synchronous verdict) */
  async submitMCQ(
    assessmentId: string,
    dto: MCQSubmitDto
  ): Promise<MCQSubmissionResult> {
    const res = await apiClient.post<ApiSuccess<MCQSubmissionResult>>(
      `/assessments/${encodeURIComponent(assessmentId)}/submissions`,
      dto
    )
    return res.data.data
  },

  /** GET /submissions/:id — poll for verdict or fetch detail */
  async getById(id: string): Promise<Submission> {
    const res = await apiClient.get<ApiSuccess<Submission>>(
      `/submissions/${encodeURIComponent(id)}`
    )
    return res.data.data
  },

  /** GET /me/submissions — paginated submission history for the current user */
  async listMine(params: ListSubmissionsParams = {}): Promise<PaginatedSubmissions> {
    // Map frontend params to backend params (backend uses 'assessment' query param)
    const { assessment, assessmentId, ...rest } = params
    const backendParams: Record<string, any> = {
      ...rest,
      ...(assessmentId || assessment ? { assessment: assessmentId || assessment } : {}),
    }
    const res = await apiClient.get<ApiSuccess<Submission[]>>('/me/submissions', { params: backendParams })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** POST /submissions/:id/rerun — faculty/platform-admin only */
  async rerun(id: string): Promise<Submission> {
    const res = await apiClient.post<ApiSuccess<Submission>>(
      `/submissions/${encodeURIComponent(id)}/rerun`
    )
    return res.data.data
  },

  /** GET /judge-runs/:id — raw Judge0 result (faculty/admin) */
  async getJudgeRun(id: string): Promise<JudgeRun> {
    const res = await apiClient.get<ApiSuccess<JudgeRun>>(
      `/judge-runs/${encodeURIComponent(id)}`
    )
    return res.data.data
  },

  /** GET /flagged-submissions — anti-cheat queue (faculty/college-admin) */
  async listFlagged(params: { limit?: number; cursor?: string } = {}): Promise<{
    items: FlaggedSubmission[]
    pagination: PaginationMeta
  }> {
    const res = await apiClient.get<ApiSuccess<FlaggedSubmission[]>>(
      '/flagged-submissions',
      { params }
    )
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** POST /flagged-submissions/:id/review — faculty/college-admin */
  async reviewFlagged(id: string, dto: ReviewFlaggedDto): Promise<FlaggedSubmission> {
    const res = await apiClient.post<ApiSuccess<FlaggedSubmission>>(
      `/flagged-submissions/${encodeURIComponent(id)}/review`,
      dto
    )
    return res.data.data
  },
}

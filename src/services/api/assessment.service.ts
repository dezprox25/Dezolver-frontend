import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type {
  Assessment,
  AssessmentStatus,
  AssessmentKind,
  CreateAssessmentDto,
  UpdateAssessmentDto,
} from '@/types/assessment.types'

export interface ListAssessmentsParams {
  status?: AssessmentStatus
  kind?: AssessmentKind
  limit?: number
  cursor?: string
}

export interface PaginatedAssessments {
  items: Assessment[]
  pagination: PaginationMeta
}

export const assessmentService = {
  async list(params: ListAssessmentsParams = {}): Promise<PaginatedAssessments> {
    const res = await apiClient.get<ApiSuccess<Assessment[]>>('/assessments', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  async getById(id: string): Promise<Assessment> {
    const res = await apiClient.get<ApiSuccess<Assessment>>(
      `/assessments/${encodeURIComponent(id)}`
    )
    return res.data.data
  },

  async create(dto: CreateAssessmentDto): Promise<Assessment> {
    // Map frontend DTO to backend expected structure
    const backendDto: Record<string, any> = {
      title: dto.title,
      kind: dto.kind === 'mcq_single' || dto.kind === 'mcq_multi' || dto.kind === 'short_answer' 
        ? 'quiz' 
        : dto.kind,
      ...(dto.problemId ? { problemId: dto.problemId } : {}),
      ...(dto.roomId ? { roomId: dto.roomId } : {}),
      ...(dto.maxAttempts !== undefined ? { maxAttempts: dto.maxAttempts } : {}),
      ...(dto.timeLimitMinutes !== undefined ? { timeLimitMinutes: dto.timeLimitMinutes } : {}),
      ...(dto.collectAntiCheat !== undefined ? { collectAntiCheat: dto.collectAntiCheat } : {}),
    }
    const res = await apiClient.post<ApiSuccess<Assessment>>('/assessments', backendDto)
    return res.data.data
  },

  async update(id: string, dto: UpdateAssessmentDto): Promise<Assessment> {
    // Map frontend DTO to backend expected structure
    const backendDto: Record<string, any> = {
      ...(dto.title ? { title: dto.title } : {}),
      ...(dto.problemId !== undefined ? { problemId: dto.problemId } : {}),
      ...(dto.roomId !== undefined ? { roomId: dto.roomId } : {}),
      ...(dto.maxAttempts !== undefined ? { maxAttempts: dto.maxAttempts } : {}),
      ...(dto.timeLimitMinutes !== undefined ? { timeLimitMinutes: dto.timeLimitMinutes } : {}),
      ...(dto.collectAntiCheat !== undefined ? { collectAntiCheat: dto.collectAntiCheat } : {}),
    }
    const res = await apiClient.patch<ApiSuccess<Assessment>>(
      `/assessments/${encodeURIComponent(id)}`,
      backendDto
    )
    return res.data.data
  },
}

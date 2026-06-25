import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type {
  Path,
  PathKind,
  PathStatus,
  CreatePathDto,
  UpdatePathDto,
  AddPathStepDto,
  UpdatePathStepDto,
  ReorderStepsDto,
} from '@/types/path.types'

export interface ListPathsParams {
  kind?: PathKind
  status?: PathStatus
  domain?: string
  limit?: number
  cursor?: string
}

export interface PaginatedPaths {
  items: Path[]
  pagination: PaginationMeta
}

/**
 * NOTE: Backend paths module is a Skeleton (audit finding).
 * Controllers reach Prisma directly, no service layer, no pagination.
 * Responses handled with graceful empty-state fallbacks.
 */
export const pathService = {
  /** GET /paths — list paths visible to caller */
  async list(params: ListPathsParams = {}): Promise<PaginatedPaths> {
    const res = await apiClient.get<ApiSuccess<Path[]>>('/paths', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** GET /paths/:id — path detail + steps + progress (if owner) */
  async getById(id: string): Promise<Path> {
    const res = await apiClient.get<ApiSuccess<Path>>(`/paths/${encodeURIComponent(id)}`)
    return res.data.data
  },

  /** POST /paths — create draft path */
  async create(dto: CreatePathDto): Promise<Path> {
    const res = await apiClient.post<ApiSuccess<Path>>('/paths', dto)
    return res.data.data
  },

  /** PATCH /paths/:id — update draft */
  async update(id: string, dto: UpdatePathDto): Promise<Path> {
    const res = await apiClient.patch<ApiSuccess<Path>>(`/paths/${encodeURIComponent(id)}`, dto)
    return res.data.data
  },

  /** POST /paths/:id/publish — publish draft path */
  async publish(id: string): Promise<Path> {
    const res = await apiClient.post<ApiSuccess<Path>>(`/paths/${encodeURIComponent(id)}/publish`)
    return res.data.data
  },

  /** POST /paths/:id/archive — archive published path */
  async archive(id: string): Promise<Path> {
    const res = await apiClient.post<ApiSuccess<Path>>(`/paths/${encodeURIComponent(id)}/archive`)
    return res.data.data
  },

  /**
   * POST /paths/:id/fork — student creates a personalized copy.
   * Returns 403 `tenant_locks_path_personalization` if tenant config disallows it.
   */
  async fork(id: string): Promise<Path> {
    const res = await apiClient.post<ApiSuccess<Path>>(`/paths/${encodeURIComponent(id)}/fork`)
    return res.data.data
  },

  // ── Step management ──────────────────────────────────────────────────────────

  async addStep(pathId: string, dto: AddPathStepDto) {
    const res = await apiClient.post<ApiSuccess<{ id: string }>>(
      `/paths/${encodeURIComponent(pathId)}/steps`,
      dto
    )
    return res.data.data
  },

  async updateStep(pathId: string, stepId: string, dto: UpdatePathStepDto) {
    const res = await apiClient.patch<ApiSuccess<{ id: string }>>(
      `/paths/${encodeURIComponent(pathId)}/steps/${encodeURIComponent(stepId)}`,
      dto
    )
    return res.data.data
  },

  async removeStep(pathId: string, stepId: string): Promise<void> {
    await apiClient.delete(
      `/paths/${encodeURIComponent(pathId)}/steps/${encodeURIComponent(stepId)}`
    )
  },

  async reorderSteps(pathId: string, dto: ReorderStepsDto): Promise<void> {
    await apiClient.post(
      `/paths/${encodeURIComponent(pathId)}/reorder-steps`,
      dto
    )
  },
}

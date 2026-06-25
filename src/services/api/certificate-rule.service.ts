import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type { IssuanceRule, CreateIssuanceRuleDto } from '@/types/certificate.types'

export const certificateRuleService = {
  /** GET /issuance-rules — list rules */
  async list(params: { limit?: number; cursor?: string } = {}): Promise<{
    items: IssuanceRule[]
    pagination: PaginationMeta
  }> {
    const res = await apiClient.get<ApiSuccess<IssuanceRule[]>>('/issuance-rules', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** POST /issuance-rules — create rule */
  async create(dto: CreateIssuanceRuleDto): Promise<IssuanceRule> {
    const res = await apiClient.post<ApiSuccess<IssuanceRule>>('/issuance-rules', dto)
    return res.data.data
  },

  /** DELETE /issuance-rules/:id — deactivate rule */
  async deactivate(id: string): Promise<void> {
    await apiClient.delete(`/issuance-rules/${encodeURIComponent(id)}`)
  },
}

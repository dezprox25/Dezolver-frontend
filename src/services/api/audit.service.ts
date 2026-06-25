import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type { AuditEntry, ListAuditParams } from '@/types/platform.types'

export const auditService = {
  /** GET /audit/entries — paginated audit log (platform_admin, platform_moderator) */
  async list(params: ListAuditParams = {}): Promise<{
    items: AuditEntry[]
    pagination: PaginationMeta
  }> {
    const res = await apiClient.get<ApiSuccess<AuditEntry[]>>('/audit/entries', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },
}

import { apiClient } from './client'
import type { ApiSuccess } from '@/types/api.types'
import type { SearchRequest, SearchResponse } from '@/types/content.types'

export const searchService = {
  /** POST /api/v1/search — cross-content full-text search */
  async search(req: SearchRequest): Promise<SearchResponse> {
    const res = await apiClient.post<ApiSuccess<SearchResponse>>('/search', req)
    return res.data.data
  },
}

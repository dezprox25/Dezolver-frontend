import { apiClient } from './client'
import type { ApiSuccess } from '@/types/api.types'
import type { CareerMap } from '@/types/path.types'

export const careerMapService = {
  /** GET /career-maps — career outcome bundles (filtered by ?domain=cse etc.) */
  async list(params: { domain?: string } = {}): Promise<CareerMap[]> {
    const res = await apiClient.get<ApiSuccess<CareerMap[]>>('/career-maps', { params })
    return res.data.data
  },

  /** GET /career-maps/:id — detail with embedded paths */
  async getById(id: string): Promise<CareerMap> {
    const res = await apiClient.get<ApiSuccess<CareerMap>>(
      `/career-maps/${encodeURIComponent(id)}`
    )
    return res.data.data
  },
}

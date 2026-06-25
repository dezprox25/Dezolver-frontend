import { apiClient } from './client'
import type { ApiSuccess } from '@/types/api.types'
import type { HealthResponse } from '@/types/platform.types'

export const healthService = {
  /** GET /health — system health check */
  async getHealth(): Promise<HealthResponse> {
    const res = await apiClient.get<ApiSuccess<HealthResponse>>('/health')
    return res.data.data
  },
}

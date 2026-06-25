import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type { Path, PathProgress, NextStepResult, RoomProgress } from '@/types/path.types'

export const progressService = {
  /** GET /me/paths — active + recently-touched personalized/enrolled paths */
  async listMyPaths(): Promise<{ items: Path[]; pagination: PaginationMeta }> {
    const res = await apiClient.get<ApiSuccess<Path[]>>('/me/paths')
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** GET /me/paths/:id/next-step — "what's next" resolver result */
  async getNextStep(pathId: string): Promise<NextStepResult> {
    const res = await apiClient.get<ApiSuccess<NextStepResult>>(
      `/me/paths/${encodeURIComponent(pathId)}/next-step`
    )
    return res.data.data
  },

  /** GET /me/paths/:id/progress — PathProgress with denormalized percentage_complete */
  async getPathProgress(pathId: string): Promise<PathProgress> {
    const res = await apiClient.get<ApiSuccess<PathProgress>>(
      `/me/paths/${encodeURIComponent(pathId)}/progress`
    )
    return res.data.data
  },

  /** POST /me/rooms/:roomId/start — mark in_progress */
  async startRoom(roomId: string): Promise<RoomProgress> {
    const res = await apiClient.post<ApiSuccess<RoomProgress>>(
      `/me/rooms/${encodeURIComponent(roomId)}/start`
    )
    return res.data.data
  },

  /** POST /me/rooms/:roomId/complete — mark completed (server validates prerequisites) */
  async completeRoom(roomId: string): Promise<RoomProgress> {
    const res = await apiClient.post<ApiSuccess<RoomProgress>>(
      `/me/rooms/${encodeURIComponent(roomId)}/complete`
    )
    return res.data.data
  },

  /** POST /me/rooms/:roomId/skip — mark skipped */
  async skipRoom(roomId: string): Promise<RoomProgress> {
    const res = await apiClient.post<ApiSuccess<RoomProgress>>(
      `/me/rooms/${encodeURIComponent(roomId)}/skip`
    )
    return res.data.data
  },
}

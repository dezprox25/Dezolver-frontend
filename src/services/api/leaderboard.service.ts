import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type {
  EventLeaderboard,
  MyStanding,
  GlobalLeaderboard,
  EventResult,
} from '@/types/event.types'

export const leaderboardService = {
  /**
   * GET /events/:id/leaderboard
   * Redis-backed during live competitions; Postgres after.
   */
  async getEventLeaderboard(eventId: string): Promise<EventLeaderboard> {
    const res = await apiClient.get<ApiSuccess<EventLeaderboard>>(
      `/events/${encodeURIComponent(eventId)}/leaderboard`
    )
    return res.data.data
  },

  /** GET /events/:id/me/standing — caller's current standing */
  async getMyStanding(eventId: string): Promise<MyStanding | null> {
    try {
      const res = await apiClient.get<ApiSuccess<MyStanding>>(
        `/events/${encodeURIComponent(eventId)}/me/standing`
      )
      return res.data.data
    } catch {
      return null
    }
  },

  /** GET /events/:id/results — final results after grading */
  async getEventResults(eventId: string): Promise<{
    items: EventResult[]
    pagination: PaginationMeta
  }> {
    const res = await apiClient.get<ApiSuccess<EventResult[]>>(
      `/events/${encodeURIComponent(eventId)}/results`
    )
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /**
   * GET /leaderboard/global — PlatformRating top-N.
   * NOTE: Backend audit flags platform_ratings table as potentially incomplete.
   */
  async getGlobal(params: { limit?: number; cursor?: string } = {}): Promise<GlobalLeaderboard> {
    const res = await apiClient.get<ApiSuccess<GlobalLeaderboard>>('/leaderboard/global', {
      params,
    })
    return res.data.data
  },

  /** GET /persons/:id/standing — person's global rank + rating */
  async getPersonStanding(
    personId: string
  ): Promise<{ rank: number; rating: number } | null> {
    try {
      const res = await apiClient.get<ApiSuccess<{ rank: number; rating: number }>>(
        `/persons/${encodeURIComponent(personId)}/standing`
      )
      return res.data.data
    } catch {
      return null
    }
  },
}

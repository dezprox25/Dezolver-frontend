import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type { Registration, RegistrationCreateResponse } from '@/types/event.types'

export interface EventParticipant {
  userId: string
  displayName?: string
  email?: string
  status: string
  source?: string
  registeredAt?: string | null
}

export const registrationService = {
  /**
   * POST /events/:id/registrations
   * Free event → 201 + Registration (status: 'registered')
   * Paid event → 200 + { registrationId, status: 'pending_payment', payment: { ... } }
   */
  async register(eventId: string): Promise<RegistrationCreateResponse> {
    const res = await apiClient.post<ApiSuccess<RegistrationCreateResponse>>(
      `/events/${encodeURIComponent(eventId)}/registrations`
    )
    return res.data.data
  },

  /** DELETE /events/:id/registrations/me — withdraw registration */
  async unregister(eventId: string): Promise<void> {
    await apiClient.delete(`/events/${encodeURIComponent(eventId)}/registrations/me`)
  },

  /**
   * GET /events/:id/registrations — organizer roster
   */
  async listParticipants(
    eventId: string,
    params: { limit?: number; cursor?: string } = {}
  ): Promise<{
    items: EventParticipant[]
    pagination: PaginationMeta
  }> {
    const res = await apiClient.get<ApiSuccess<EventParticipant[]>>(
      `/events/${encodeURIComponent(eventId)}/registrations`,
      { params }
    )
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** GET /events/:id/registrations/:userId — get specific registration */
  async getMyRegistration(eventId: string): Promise<Registration | null> {
    try {
      const res = await apiClient.get<ApiSuccess<Registration>>(
        `/events/${encodeURIComponent(eventId)}/registrations/me`
      )
      return res.data.data
    } catch {
      return null
    }
  },
}

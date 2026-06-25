import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type {
  Event,
  EventStatus,
  EventKind,
  AudienceScope,
  CreateEventDto,
  UpdateEventDto,
  ExtendEventDto,
  CompetitionSubmitDto,
} from '@/types/event.types'
import type { SubmissionCreateResponse } from '@/types/assessment.types'

export interface ListEventsParams {
  kind?: EventKind
  status?: EventStatus
  audienceScope?: AudienceScope
  from?: string
  to?: string
  limit?: number
  cursor?: string
}

export interface PaginatedEvents {
  items: Event[]
  pagination: PaginationMeta
}

export const eventService = {
  /** GET /events — list events visible to caller */
  async list(params: ListEventsParams = {}): Promise<PaginatedEvents> {
    const res = await apiClient.get<ApiSuccess<Event[]>>('/events', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** GET /events/:id — event detail + caller's registration state */
  async getById(id: string): Promise<Event> {
    const res = await apiClient.get<ApiSuccess<Event>>(`/events/${encodeURIComponent(id)}`)
    return res.data.data
  },

  /** POST /events — create event (faculty/college-admin/platform-admin) */
  async create(dto: CreateEventDto): Promise<Event> {
    const res = await apiClient.post<ApiSuccess<Event>>('/events', dto)
    return res.data.data
  },

  /** PATCH /events/:id — update draft event */
  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const res = await apiClient.patch<ApiSuccess<Event>>(
      `/events/${encodeURIComponent(id)}`,
      dto
    )
    return res.data.data
  },

  /** POST /events/:id/publish — move draft → published */
  async publish(id: string): Promise<Event> {
    const res = await apiClient.post<ApiSuccess<Event>>(
      `/events/${encodeURIComponent(id)}/publish`
    )
    return res.data.data
  },

  /** POST /events/:id/cancel — cancel the event */
  async cancel(id: string): Promise<Event> {
    const res = await apiClient.post<ApiSuccess<Event>>(
      `/events/${encodeURIComponent(id)}/cancel`
    )
    return res.data.data
  },

  /** POST /events/:id/extend — extend end time (privileged, audited) */
  async extend(id: string, dto: ExtendEventDto): Promise<Event> {
    const res = await apiClient.post<ApiSuccess<Event>>(
      `/events/${encodeURIComponent(id)}/extend`,
      dto
    )
    return res.data.data
  },

  /**
   * POST /events/:id/submissions — submit solution during live competition.
   * Returns 202 + submissionId; verdict arrives via WebSocket.
   */
  async submitSolution(
    eventId: string,
    dto: CompetitionSubmitDto
  ): Promise<SubmissionCreateResponse> {
    const res = await apiClient.post<ApiSuccess<SubmissionCreateResponse>>(
      `/events/${encodeURIComponent(eventId)}/submissions`,
      dto
    )
    return res.data.data
  },

  /** GET /time — server timestamp for countdown sync */
  async getServerTime(): Promise<{ serverNow: string; eventEndsAt?: string }> {
    const res = await apiClient.get<ApiSuccess<{ serverNow: string; eventEndsAt?: string }>>('/time')
    return res.data.data
  },
}

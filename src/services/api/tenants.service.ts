import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type {
  Tenant,
  Cohort,
  Invitation,
  CreateTenantDto,
  UpdateTenantDto,
  TransitionTenantDto,
  TenantConfig,
  CreateCohortDto,
  CreateInvitationDto,
  TenantStatus,
} from '@/types/tenancy.types'

// ─── List params ──────────────────────────────────────────────────────────────

export interface ListTenantsParams {
  status?: string
  kind?: string
  limit?: number
  cursor?: string
}

export interface ListInvitationsParams {
  status?: string
  limit?: number
  cursor?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const tenantsService = {
  // ── Platform admin: Tenant CRUD ──────────────────────────────────────────

  async list(params: ListTenantsParams = {}): Promise<PaginatedResponse<Tenant>> {
    const res = await apiClient.get<ApiSuccess<Tenant[]>>('/tenants', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const res = await apiClient.post<ApiSuccess<Tenant>>('/tenants', dto)
    return res.data.data
  },

  async getById(id: string): Promise<Tenant> {
    const res = await apiClient.get<ApiSuccess<Tenant>>(`/tenants/${encodeURIComponent(id)}`)
    return res.data.data
  },

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const res = await apiClient.patch<ApiSuccess<Tenant>>(
      `/tenants/${encodeURIComponent(id)}`,
      dto
    )
    return res.data.data
  },

  async transition(
    id: string,
    dto: TransitionTenantDto
  ): Promise<{ id: string; status: TenantStatus; statusChangedAt: string }> {
    const res = await apiClient.post<
      ApiSuccess<{ id: string; status: TenantStatus; statusChangedAt: string }>
    >(`/tenants/${encodeURIComponent(id)}/transition`, dto)
    return res.data.data
  },

  // ── Tenant config ────────────────────────────────────────────────────────

  async getConfig(id: string): Promise<TenantConfig> {
    const res = await apiClient.get<ApiSuccess<TenantConfig>>(
      `/tenants/${encodeURIComponent(id)}/config`
    )
    return res.data.data
  },

  async updateConfig(id: string, config: TenantConfig): Promise<TenantConfig> {
    const res = await apiClient.put<ApiSuccess<TenantConfig>>(
      `/tenants/${encodeURIComponent(id)}/config`,
      config
    )
    return res.data.data
  },

  // ── Cohorts ──────────────────────────────────────────────────────────────

  async listCohorts(tenantId: string): Promise<Cohort[]> {
    const res = await apiClient.get<ApiSuccess<Cohort[]>>(
      `/tenants/${encodeURIComponent(tenantId)}/cohorts`
    )
    return res.data.data
  },

  async createCohort(tenantId: string, dto: CreateCohortDto): Promise<Cohort> {
    const res = await apiClient.post<ApiSuccess<Cohort>>(
      `/tenants/${encodeURIComponent(tenantId)}/cohorts`,
      dto
    )
    return res.data.data
  },

  // ── Invitations ──────────────────────────────────────────────────────────

  async listInvitations(
    tenantId: string,
    params: ListInvitationsParams = {}
  ): Promise<PaginatedResponse<Invitation>> {
    const res = await apiClient.get<ApiSuccess<Invitation[]>>(
      `/tenants/${encodeURIComponent(tenantId)}/invitations`,
      { params }
    )
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  async createInvitation(tenantId: string, dto: CreateInvitationDto): Promise<Invitation> {
    const res = await apiClient.post<ApiSuccess<Invitation>>(
      `/tenants/${encodeURIComponent(tenantId)}/invitations`,
      dto
    )
    return res.data.data
  },

  async revokeInvitation(tenantId: string, invId: string): Promise<void> {
    await apiClient.delete(
      `/tenants/${encodeURIComponent(tenantId)}/invitations/${encodeURIComponent(invId)}`
    )
  },
}

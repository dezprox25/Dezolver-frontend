import { apiClient } from './client'
import type { ApiSuccess } from '@/types/api.types'
import type { UserRole, TenantKind } from '@/types/auth.types'

export interface PersonDetail {
  id: string
  primaryEmail: string
  displayName: string
  platformRating: number
  createdAt: string
  users: Array<{
    id: string
    tenantId: string
    tenantKind: TenantKind
    tenantName?: string
    roles: UserRole[]
    primaryRole: UserRole
    status: string
    mfaEnabled: boolean
  }>
}

export interface ImpersonateResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: {
    id: string
    personId: string
    tenantId: string
    tenantKind: TenantKind
    email: string
    fullName: string
    roles: string[]
    mfaEnabled: boolean
  }
}

export const personsService = {
  /** GET /persons/:id — platform-admin only; returns full person + all linked users */
  async getById(id: string): Promise<PersonDetail> {
    const res = await apiClient.get<ApiSuccess<PersonDetail>>(
      `/persons/${encodeURIComponent(id)}`
    )
    return res.data.data
  },

  /** POST /users/:userId/impersonate — platform-admin only */
  async impersonate(
    userId: string,
    dto: { caseId?: string; justification: string }
  ): Promise<ImpersonateResponse> {
    const res = await apiClient.post<ApiSuccess<ImpersonateResponse>>(
      `/users/${encodeURIComponent(userId)}/impersonate`,
      dto
    )
    return res.data.data
  },
}

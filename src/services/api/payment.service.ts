import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type { Payment, CollegePayout } from '@/types/billing.types'
import { API_BASE_URL } from '@/lib/constants'

export const paymentService = {
  /** GET /payments — payment history for authenticated user/tenant */
  async list(params: { limit?: number; cursor?: string } = {}): Promise<{
    items: Payment[]
    pagination: PaginationMeta
  }> {
    const res = await apiClient.get<ApiSuccess<Payment[]>>('/payments', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** GET /payments/:id — single payment detail */
  async getById(id: string): Promise<Payment> {
    const res = await apiClient.get<ApiSuccess<Payment>>(
      `/payments/${encodeURIComponent(id)}`
    )
    return res.data.data
  },

  // ── Admin ───────────────────────────────────────────────────────────────────

  /** POST /admin/v1/billing/refunds — issue refund (platform-admin only) */
  async issueRefund(dto: {
    paymentId: string
    amountPaise?: number
    reason: string
  }): Promise<{ refundId: string; status: string }> {
    const res = await apiClient.post<ApiSuccess<{ refundId: string; status: string }>>(
      `${API_BASE_URL}/admin/v1/billing/refunds`,
      dto
    )
    return res.data.data
  },

  /** GET /admin/v1/billing/payouts — college payout list */
  async listPayouts(params: { limit?: number; cursor?: string } = {}): Promise<{
    items: CollegePayout[]
    pagination: PaginationMeta
  }> {
    const res = await apiClient.get<ApiSuccess<CollegePayout[]>>(`${API_BASE_URL}/admin/v1/billing/payouts`, { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** POST /admin/v1/billing/payouts/:id/initiate — trigger manual NEFT payout */
  async initiatePayout(payoutId: string, notes?: string): Promise<CollegePayout> {
    const res = await apiClient.post<ApiSuccess<CollegePayout>>(
      `${API_BASE_URL}/admin/v1/billing/payouts/${encodeURIComponent(payoutId)}/initiate`,
      notes ? { notes } : {}
    )
    return res.data.data
  },
}

import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type {
  Plan,
  Subscription,
  CreateSubscriptionResponse,
  UpgradeSubscriptionResponse,
  CreateSubscriptionDto,
  UpgradeSubscriptionDto,
  CancelSubscriptionDto,
} from '@/types/billing.types'

/**
 * Backend status: Partial (audit finding).
 * Key limitation: handleSubscriptionCharged is a stub — subscriptions do NOT
 * automatically activate after Razorpay payment. The checkout flow runs but
 * activation requires the webhook to be fully implemented.
 */
export const billingService = {
  // ── Plans ───────────────────────────────────────────────────────────────────

  /** GET /plans — list available plans */
  async listPlans(params: { appliesTo?: string } = {}): Promise<Plan[]> {
    const res = await apiClient.get<ApiSuccess<Plan[]>>('/plans', { params })
    return res.data.data
  },

  // ── Subscriptions ───────────────────────────────────────────────────────────

  /**
   * POST /subscriptions — create subscription.
   * For college (B2B): returns razorpay.orderId → open Razorpay order checkout.
   * For direct (B2C): returns razorpay.subscriptionId → open Razorpay subscription checkout.
   * NOTE: handleSubscriptionCharged is a stub. Subscription will remain 'pending'
   * after payment until backend billing webhook handler is implemented.
   */
  async createSubscription(dto: CreateSubscriptionDto): Promise<CreateSubscriptionResponse> {
    const res = await apiClient.post<ApiSuccess<CreateSubscriptionResponse>>('/subscriptions', dto)
    return res.data.data
  },

  /** GET /subscriptions/:id — subscription detail */
  async getSubscription(id: string): Promise<Subscription> {
    const res = await apiClient.get<ApiSuccess<Subscription>>(
      `/subscriptions/${encodeURIComponent(id)}`
    )
    return res.data.data
  },

  /**
   * GET /subscriptions — list subscriptions (current user's or admin view).
   * NOTE: Not in explicit API spec; follows REST convention.
   */
  async listSubscriptions(params: { limit?: number; cursor?: string } = {}): Promise<{
    items: Subscription[]
    pagination: PaginationMeta
  }> {
    const res = await apiClient.get<ApiSuccess<Subscription[]>>('/subscriptions', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** POST /subscriptions/:id/upgrade — pro-rata order created; returns Razorpay orderId */
  async upgradeSubscription(id: string, dto: UpgradeSubscriptionDto): Promise<UpgradeSubscriptionResponse> {
    const res = await apiClient.post<ApiSuccess<UpgradeSubscriptionResponse>>(
      `/subscriptions/${encodeURIComponent(id)}/upgrade`,
      dto
    )
    return res.data.data
  },

  /** POST /subscriptions/:id/cancel */
  async cancelSubscription(id: string, dto: CancelSubscriptionDto): Promise<Subscription> {
    const res = await apiClient.post<ApiSuccess<Subscription>>(
      `/subscriptions/${encodeURIComponent(id)}/cancel`,
      dto
    )
    return res.data.data
  },

  /** POST /subscriptions/:id/retry-payment — resume past_due flow */
  async retryPayment(id: string): Promise<CreateSubscriptionResponse> {
    const res = await apiClient.post<ApiSuccess<CreateSubscriptionResponse>>(
      `/subscriptions/${encodeURIComponent(id)}/retry-payment`
    )
    return res.data.data
  },

  /** GET /subscriptions/tenant/:tenantId — active subscription for a specific tenant */
  async getByTenant(tenantId: string): Promise<Subscription> {
    const res = await apiClient.get<ApiSuccess<Subscription>>(
      `/subscriptions/tenant/${encodeURIComponent(tenantId)}`
    )
    return res.data.data
  },
}

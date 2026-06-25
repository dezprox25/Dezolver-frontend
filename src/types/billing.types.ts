// ─── Plan ─────────────────────────────────────────────────────────────────────

export type PlanAppliesTo = 'college' | 'direct' | 'both'
export type BillingCycle = 'monthly' | 'annual'

export interface PlanFeatures {
  maxStudents?: number | null
  maxFaculty?: number | null
  maxCohorts?: number | null
  events_competitions?: boolean
  assessments?: boolean
  certificates?: boolean
  analytics?: boolean
  sso?: boolean
  paths?: boolean
  curriculum?: boolean
  support?: 'email' | 'priority' | 'dedicated'
  apiRateLimit?: number
  [key: string]: unknown
}

export interface PlanPricing {
  monthly: number
  annual: number
  currency: 'INR'
}

export interface Plan {
  id: string
  code: string
  name: string
  description?: string | null
  appliesTo: PlanAppliesTo
  pricing: PlanPricing
  features: PlanFeatures
  isActive: boolean
  sortOrder?: number
  createdAt: string
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'pending'
  | 'trial'
  | 'active'
  | 'past_due'
  | 'suspended'
  | 'expired'
  | 'cancelled'

export interface Subscription {
  id: string
  tenantId?: string | null
  userId?: string | null
  planCode: string
  planName?: string
  status: SubscriptionStatus
  billingCycle: BillingCycle
  currentPeriodStart?: string | null
  currentPeriodEnd?: string | null
  trialEndsAt?: string | null
  cancelledAt?: string | null
  pastDueAt?: string | null
  amountInr?: number
  createdAt: string
  // Razorpay reference
  razorpaySubscriptionId?: string | null
  razorpayOrderId?: string | null
}

export interface CreateSubscriptionResponse {
  subscriptionId: string
  status: SubscriptionStatus
  amountInr: number
  billingCycle: BillingCycle
  razorpay: {
    orderId?: string
    subscriptionId?: string
    publicKey: string
    checkoutUrl?: string | null
  }
}

export interface UpgradeSubscriptionResponse {
  subscriptionId: string
  razorpay: {
    orderId: string
    publicKey: string
    amountInr: number
  }
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void' | 'uncollectible'

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitAmountInr: number
  totalAmountInr: number
  gstRate?: number
}

export interface Invoice {
  id: string
  invoiceNumber?: string
  subscriptionId?: string | null
  tenantId?: string | null
  status: InvoiceStatus
  amountInr: number
  taxAmountInr?: number
  totalAmountInr?: number
  billingPeriodStart?: string | null
  billingPeriodEnd?: string | null
  issuedAt?: string | null
  paidAt?: string | null
  dueAt?: string | null
  lineItems?: InvoiceLineItem[]
  createdAt: string
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded' | 'partially_refunded'
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'emi'

export interface Payment {
  id: string
  invoiceId?: string | null
  subscriptionId?: string | null
  tenantId?: string | null
  amountInr: number
  status: PaymentStatus
  method?: PaymentMethod | null
  razorpayPaymentId?: string | null
  razorpayOrderId?: string | null
  createdAt: string
  capturedAt?: string | null
}

// ─── Payout ───────────────────────────────────────────────────────────────────

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface CollegePayout {
  id: string
  tenantId: string
  tenantName?: string
  periodMonth: string
  grossInr: number
  platformFeeInr: number
  refundedInr: number
  netInr: number
  status: PayoutStatus
  createdAt: string
  completedAt?: string | null
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateSubscriptionDto {
  planCode: string
  tenantId?: string
  billingCycle?: BillingCycle
}

export interface UpgradeSubscriptionDto {
  planCode: string
}

export interface CancelSubscriptionDto {
  effective: 'immediate' | 'period_end'
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  pending: 'Pending',
  trial: 'Trial',
  active: 'Active',
  past_due: 'Past Due',
  suspended: 'Suspended',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  issued: 'Issued',
  paid: 'Paid',
  void: 'Void',
  uncollectible: 'Uncollectible',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  captured: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
  partially_refunded: 'Partially Refunded',
}

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
}

export function formatCurrencyINR(amountInr: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amountInr)
}

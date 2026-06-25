import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useEffect, useCallback } from 'react'
import { billingService } from '@/services/api/billing.service'
import type {
  CreateSubscriptionDto,
  UpgradeSubscriptionDto,
  CancelSubscriptionDto,
} from '@/types/billing.types'
import { QUERY_KEYS } from '@/lib/constants'
import { getSocket } from '@/services/websocket/client'

// ─── Plans ────────────────────────────────────────────────────────────────────

export function usePlans(appliesTo?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BILLING_PLANS, appliesTo],
    queryFn: () => billingService.listPlans(appliesTo ? { appliesTo } : {}),
    staleTime: 10 * 60 * 1000,
  })
}

// ─── My Subscription ─────────────────────────────────────────────────────────

export function useTenantSubscription(tenantId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BILLING_SUBSCRIPTION, 'tenant', tenantId],
    queryFn: () => billingService.getByTenant(tenantId!),
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
    retry: (count, err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) return false
      return count < 2
    },
  })
}

export function useSubscription(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BILLING_SUBSCRIPTION, id],
    queryFn: () => billingService.getSubscription(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useSubscriptions() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.BILLING_SUBSCRIPTIONS,
    queryFn: ({ pageParam }) =>
      billingService.listSubscriptions({ cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateSubscriptionDto) => billingService.createSubscription(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_SUBSCRIPTION })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_SUBSCRIPTIONS })
    },
  })
}

export function useUpgradeSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpgradeSubscriptionDto }) =>
      billingService.upgradeSubscription(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_SUBSCRIPTION })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_SUBSCRIPTIONS })
    },
  })
}

export function useCancelSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CancelSubscriptionDto }) =>
      billingService.cancelSubscription(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.BILLING_SUBSCRIPTION, updated.id], updated)
    },
  })
}

export function useRetryPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => billingService.retryPayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_SUBSCRIPTION })
    },
  })
}

// ─── WebSocket: billing events ────────────────────────────────────────────────

interface BillingEvent {
  type: string
  subscriptionId?: string
  invoiceId?: string
  status?: string
}

export function useBillingUpdates(
  onUpdate?: (event: BillingEvent) => void
) {
  const qc = useQueryClient()

  const handle = useCallback(
    (event: BillingEvent) => {
      // Invalidate billing caches on any billing WS event
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_SUBSCRIPTION })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_SUBSCRIPTIONS })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_INVOICES })
      onUpdate?.(event)
    },
    [qc, onUpdate]
  )

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    socket.on('billing:updated', handle)
    socket.on('subscription:changed', handle)
    socket.on('invoice:generated', handle)
    socket.on('payment:failed', handle)
    return () => {
      socket.off('billing:updated', handle)
      socket.off('subscription:changed', handle)
      socket.off('invoice:generated', handle)
      socket.off('payment:failed', handle)
    }
  }, [handle])
}

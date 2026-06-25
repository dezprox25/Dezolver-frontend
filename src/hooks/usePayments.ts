import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { paymentService } from '@/services/api/payment.service'
import { QUERY_KEYS } from '@/lib/constants'

export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BILLING_PAYMENTS, id],
    queryFn: () => paymentService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePayments() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.BILLING_PAYMENTS,
    queryFn: ({ pageParam }) =>
      paymentService.list({ cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 2 * 60 * 1000,
  })
}

export function useIssueRefund() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ paymentId, amountInr, reason }: { paymentId: string; amountInr?: number; reason: string }) =>
      paymentService.issueRefund({
        paymentId,
        amountPaise: amountInr !== undefined ? Math.round(amountInr * 100) : undefined,
        reason,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_PAYMENTS })
    },
  })
}

export function usePayouts() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.BILLING_PAYOUTS,
    queryFn: ({ pageParam }) =>
      paymentService.listPayouts({ cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 5 * 60 * 1000,
  })
}

export function useInitiatePayout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      paymentService.initiatePayout(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_PAYOUTS })
    },
  })
}

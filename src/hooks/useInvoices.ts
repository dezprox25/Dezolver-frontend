import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query'
import { invoiceService, type ListInvoicesParams } from '@/services/api/invoice.service'
import { QUERY_KEYS } from '@/lib/constants'

export function useInvoices(params: Omit<ListInvoicesParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.BILLING_INVOICES, params],
    queryFn: ({ pageParam }) =>
      invoiceService.list({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 2 * 60 * 1000,
  })
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BILLING_INVOICES, id],
    queryFn: () => invoiceService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (id: string) => invoiceService.downloadPdf(id),
  })
}

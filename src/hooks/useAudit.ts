import { useInfiniteQuery } from '@tanstack/react-query'
import { auditService } from '@/services/api/audit.service'
import type { ListAuditParams } from '@/types/platform.types'
import { QUERY_KEYS } from '@/lib/constants'

export function useAuditEntries(params: Omit<ListAuditParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.AUDIT_ENTRIES, params],
    queryFn: ({ pageParam }) =>
      auditService.list({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? (last.pagination.nextCursor ?? undefined) : undefined,
    staleTime: 30 * 1000,
  })
}

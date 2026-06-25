import { useQuery } from '@tanstack/react-query'
import { searchService } from '@/services/api/search.service'
import type { SearchRequest, SearchKind, SearchFilters } from '@/types/content.types'
import { QUERY_KEYS } from '@/lib/constants'

export function useContentSearch(
  q: string,
  kind: SearchKind = 'all',
  filters?: SearchFilters
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SEARCH, q, kind, filters],
    queryFn: () => searchService.search({ q, kind, filters }),
    enabled: q.trim().length >= 2,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  })
}

export function useDebouncedSearch(
  q: string,
  kind: SearchKind = 'all',
  filters?: SearchFilters
) {
  return useQuery<Awaited<ReturnType<typeof searchService.search>>>({
    queryKey: [...QUERY_KEYS.SEARCH, 'debounced', q, kind, filters],
    queryFn: () => searchService.search({ q, kind, filters } as SearchRequest),
    enabled: q.trim().length >= 2,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  })
}

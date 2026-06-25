import { useQuery } from '@tanstack/react-query'
import { healthService } from '@/services/api/health.service'
import { QUERY_KEYS } from '@/lib/constants'

export function useSystemHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM_HEALTH,
    queryFn: () => healthService.getHealth(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

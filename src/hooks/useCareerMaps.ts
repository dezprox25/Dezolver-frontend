import { useQuery } from '@tanstack/react-query'
import { careerMapService } from '@/services/api/career-map.service'
import { QUERY_KEYS } from '@/lib/constants'

export function useCareerMaps(domain?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CAREER_MAPS, domain],
    queryFn: () => careerMapService.list({ domain }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCareerMap(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CAREER_MAPS, id],
    queryFn: () => careerMapService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

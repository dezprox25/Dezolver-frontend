import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantsService } from '@/services/api/tenants.service'
import type { CreateCohortDto } from '@/types/tenancy.types'
import { QUERY_KEYS } from '@/lib/constants'

export function useCohorts(tenantId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.TENANTS, tenantId, 'cohorts'],
    queryFn: () => tenantsService.listCohorts(tenantId!),
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCohort(tenantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateCohortDto) => tenantsService.createCohort(tenantId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.TENANTS, tenantId, 'cohorts'],
      })
    },
  })
}
